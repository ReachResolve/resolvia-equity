
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.8.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 200,
    });
  }
  
  // Get the JWT token from the request header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  }
  
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: "Missing environment variables" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
  
  // Create a Supabase client with the service key for internal operations
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Get all pending buy orders sorted by price (highest first) and timestamp
    const { data: buyOrders, error: buyError } = await supabase
      .from("orders")
      .select("*")
      .eq("type", "buy")
      .eq("status", "pending")
      .order("price", { ascending: false })
      .order("timestamp", { ascending: true });
      
    if (buyError) {
      throw buyError;
    }
    
    // Get all pending sell orders sorted by price (lowest first) and timestamp
    const { data: sellOrders, error: sellError } = await supabase
      .from("orders")
      .select("*")
      .eq("type", "sell")
      .eq("status", "pending")
      .order("price", { ascending: true })
      .order("timestamp", { ascending: true });
      
    if (sellError) {
      throw sellError;
    }
    
    const matches = [];
    
    // Try to match orders
    for (const buyOrder of buyOrders) {
      if (sellOrders.length === 0) break;
      
      // Find compatible sell orders (price <= buy price)
      const compatibleSellOrders = sellOrders.filter(
        sellOrder => parseFloat(sellOrder.price) <= parseFloat(buyOrder.price) && 
                    sellOrder.user_id !== buyOrder.user_id
      );
      
      if (compatibleSellOrders.length > 0) {
        // Take the first compatible sell order (lowest price, earliest timestamp)
        const sellOrder = compatibleSellOrders[0];
        
        // Determine the number of shares to trade
        const sharesToTrade = Math.min(buyOrder.shares, sellOrder.shares);
        
        // Use the sell price for the transaction
        const transactionPrice = parseFloat(sellOrder.price);
        
        if (sharesToTrade > 0) {
          // Check buyer has enough funds
          const { data: buyerProfile, error: buyerError } = await supabase
            .from("profiles")
            .select("balance")
            .eq("id", buyOrder.user_id)
            .single();
            
          if (buyerError) {
            console.error("Error fetching buyer profile:", buyerError);
            continue;
          }
          
          // Check seller has enough shares
          const { data: sellerProfile, error: sellerError } = await supabase
            .from("profiles")
            .select("shares_owned")
            .eq("id", sellOrder.user_id)
            .single();
            
          if (sellerError) {
            console.error("Error fetching seller profile:", sellerError);
            continue;
          }
          
          const totalCost = sharesToTrade * transactionPrice;
          
          if (parseFloat(buyerProfile.balance) < totalCost) {
            console.error("Buyer has insufficient funds");
            continue;
          }
          
          if (sellerProfile.shares_owned < sharesToTrade) {
            console.error("Seller has insufficient shares");
            continue;
          }
          
          // Create transaction records
          const buyTransaction = {
            user_id: buyOrder.user_id,
            type: "buy",
            shares: sharesToTrade,
            price: transactionPrice,
            counterparty_id: sellOrder.user_id
          };
          
          const sellTransaction = {
            user_id: sellOrder.user_id,
            type: "sell",
            shares: sharesToTrade,
            price: transactionPrice,
            counterparty_id: buyOrder.user_id
          };
          
          // Insert transactions
          const { error: txError } = await supabase
            .from("transactions")
            .insert([buyTransaction, sellTransaction]);
            
          if (txError) {
            console.error("Error creating transactions:", txError);
            continue;
          }
          
          // Update buyer profile
          const { error: buyerUpdateError } = await supabase
            .from("profiles")
            .update({
              balance: parseFloat(buyerProfile.balance) - totalCost,
              shares_owned: supabase.rpc("increment", { num: sharesToTrade })
            })
            .eq("id", buyOrder.user_id);
            
          if (buyerUpdateError) {
            console.error("Error updating buyer profile:", buyerUpdateError);
            continue;
          }
          
          // Update seller profile
          const { error: sellerUpdateError } = await supabase
            .from("profiles")
            .update({
              balance: supabase.rpc("increment", { num: totalCost }),
              shares_owned: supabase.rpc("decrement", { num: sharesToTrade })
            })
            .eq("id", sellOrder.user_id);
            
          if (sellerUpdateError) {
            console.error("Error updating seller profile:", sellerUpdateError);
            continue;
          }
          
          // Update orders
          if (buyOrder.shares === sharesToTrade) {
            // Complete the buy order
            await supabase
              .from("orders")
              .update({ status: "completed" })
              .eq("id", buyOrder.id);
          } else {
            // Reduce the buy order quantity
            await supabase
              .from("orders")
              .update({ shares: buyOrder.shares - sharesToTrade })
              .eq("id", buyOrder.id);
          }
          
          if (sellOrder.shares === sharesToTrade) {
            // Complete the sell order
            await supabase
              .from("orders")
              .update({ status: "completed" })
              .eq("id", sellOrder.id);
              
            // Remove from sellOrders array
            const index = sellOrders.indexOf(sellOrder);
            if (index > -1) {
              sellOrders.splice(index, 1);
            }
          } else {
            // Reduce the sell order quantity
            await supabase
              .from("orders")
              .update({ shares: sellOrder.shares - sharesToTrade })
              .eq("id", sellOrder.id);
              
            // Update in sellOrders array
            sellOrder.shares -= sharesToTrade;
          }
          
          matches.push({
            buyOrderId: buyOrder.id,
            sellOrderId: sellOrder.id,
            shares: sharesToTrade,
            price: transactionPrice
          });
        }
      }
    }
    
    return new Response(JSON.stringify({ success: true, matches }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in matchOrders:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
