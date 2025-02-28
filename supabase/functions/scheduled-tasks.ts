
// This file contains scheduled tasks for the Supabase project
// It's not meant to be deployed directly, but serves as documentation
// for the scheduled tasks that should be set up in the Supabase dashboard

/*
Scheduled Task: Order Matching
Description: Matches buy and sell orders to execute trades
Schedule: Every 5 minutes
HTTP Method: POST
URL: https://cllkqwxulrxhrbigegia.supabase.co/functions/v1/matchOrders
Headers: 
  Authorization: Bearer <service_role_key>

Payload: {}
*/
