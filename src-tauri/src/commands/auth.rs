use crate::api::responses::{
    APIErrorResponse, AuthResponse, GoogleAuth, LoginData, SignupData, ValidateResponse
};
use crate::api::utils::api_request;
use crate::constants;
use crate::{api::utils::ReqType, constants::API_BASE, AppState};

#[tauri::command]
pub async fn signup(data: SignupData, state: AppState<'_>) -> Result<(), String> {
    let locked_state = state.lock().await;
    locked_state.token_store.delete("access_token");

    let api_url = format!("{}/auth/signup", API_BASE);
    let res = api_request::<AuthResponse>(api_url, false, ReqType::POST, Some(data), &state).await;

    match res {
        Ok(response) => {
            locked_state
                .token_store
                .set("access_token", response.access_token);
            if locked_state.token_store.save().is_err() {
                return Err("Failed to save access token".to_string());
            }
            Ok(())
        }
        Err(err) => return Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn login(data: LoginData, state: AppState<'_>) -> Result<(), String> {
    let locked_state = state.lock().await;
    locked_state.token_store.delete("access_token");

    let api_url = format!("{}/auth/login", API_BASE);
    let res = api_request::<AuthResponse>(api_url, false, ReqType::POST, Some(data), &state).await;

    match res {
        Ok(response) => {
            locked_state
                .token_store
                .set("access_token", response.access_token);
            if locked_state.token_store.save().is_err() {
                return Err("Failed to save access token".to_string());
            }
            Ok(())
        }
        Err(err) => return Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn generate_auth_url(port: i32) -> Result<(String, String), String> {
    let redirect_uri = format!("http%3A//localhost:{}", port);
    Ok((format!(
        "https://accounts.google.com/o/oauth2/auth?response_type=code&client_id={}&redirect_uri={}&scope=email%20profile",
        constants::GOOGLE_CLIENT_ID,
        redirect_uri
    ), redirect_uri))
}

#[tauri::command]
pub async fn google_auth(data: GoogleAuth, state: AppState<'_>) -> Result<(), String> {
    let locked_state = state.lock().await;
    locked_state.token_store.delete("access_token");

    let api_url = format!("{}/auth/googleCallback", API_BASE);
    let res = api_request::<AuthResponse>(api_url, false, ReqType::POST, Some(data), &state).await;

    match res {
        Ok(response) => {
            locked_state
                .token_store
                .set("access_token", response.access_token);
            if locked_state.token_store.save().is_err() {
                return Err("Failed to save access token".to_string());
            }
            Ok(())
        }
        Err(err) => return Err(err.to_string()),
    }
}

#[tauri::command]
pub async fn validate_token(state: AppState<'_>) -> Result<bool, String> {
    let api_url = format!("{}/auth/validateToken", API_BASE);
    let res = api_request::<ValidateResponse>(
        api_url,
        true,
        ReqType::GET,
        Option::<ValidateResponse>::None,
        &state,
    )
    .await;

    match res {
        Ok(res) => Ok(res.valid),
        Err(APIErrorResponse::InvalidToken) => Ok(false),
        Err(err) => {
            return Err(err.to_string());
        }
    }
}

#[tauri::command]
pub async fn logout(state: AppState<'_>) -> Result<(), String> {
    let state = state.lock().await;
    let removed = state.token_store.delete("access_token");
    if !removed {
        return Err("Failed to remove access token".to_string());
    }

    Ok(())
}
