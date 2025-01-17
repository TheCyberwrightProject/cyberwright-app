use crate::api::utils::api_request;
use crate::api::utils::ReqType::GET;
use crate::constants::API_BASE;
use crate::AppData;
use serde::{Deserialize, Serialize};
use tauri::State;
use tokio::sync::Mutex;

#[derive(Deserialize, Serialize)]
pub struct AccountInfo {
    name: String,
    email: String,
    pfp_url: String,
}

#[derive(Deserialize, Serialize)]
pub struct AccountInfoRes {
    info: AccountInfo,
    account_type: String,
}

#[tauri::command]
pub async fn get_account_info(state: State<'_, Mutex<AppData>>) -> Result<AccountInfoRes, String> {
    let api_url = format!("{}/user/accountInfo", API_BASE);
    let res =
        api_request::<AccountInfoRes>(api_url, true, GET, Option::<AccountInfoRes>::None, &state).await;

    match res {
        Ok(data) => Ok(data),
        Err(err) => return Err(err.to_string()),
    }
}
