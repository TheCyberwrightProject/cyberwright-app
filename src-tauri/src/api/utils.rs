use crate::api::responses::ErrorResponse;
use crate::AppState;
use reqwest::header::{HeaderMap, HeaderValue};
use serde_json::Value;

use super::responses::APIErrorResponse;

pub enum ReqType {
    GET,
    POST,
}

pub async fn api_request<T>(
    api_url: String,
    authenticated: bool,
    method: ReqType,
    data: Option<impl serde::Serialize>,
    state: &AppState<'_>,
) -> Result<T, APIErrorResponse>
where
    T: serde::de::DeserializeOwned,
{
    let client = reqwest::Client::new();

    let mut request = match method {
        ReqType::GET => client.get(api_url),
        ReqType::POST => {
            let mut req = client.post(api_url);
            if let Some(body) = data {
                req = req.json(&body);
            }
            req
        }
    };

    if authenticated {
        let mut headers = HeaderMap::new();
        let token = get_access_token(state).await;
        if token.is_none() {
            return Err(APIErrorResponse::InvalidToken);
        }
        headers.insert(
            "Authorization",
            HeaderValue::from_str(&format!("Bearer {}", token.unwrap()))
                .map_err(|_| APIErrorResponse::Unknown)?,
        );
        request = request.headers(headers);
    }

    let response = request
        .send()
        .await
        .map_err(|e| APIErrorResponse::RequestFailed(e.to_string()))?;

    if response.status().is_success() {
        let res_convert: Result<T, _> = response.json().await;
        match res_convert {
            Ok(response_body) => Ok(response_body),
            Err(err) => {
                println!("{:#?}", err);
                Err(APIErrorResponse::DeserializeError)
            },
        }
    } else {
        let error_response: Result<ErrorResponse, _> = response.json().await;

        match error_response {
            Ok(err) => Err(APIErrorResponse::RequestErrored(err.error)),
            Err(_) => Err(APIErrorResponse::Unknown),
        }
    }
}

pub async fn get_access_token(state: &AppState<'_>) -> Option<Value> {
    let state = state.lock().await;
    let token = state.token_store.get("access_token");
    return token;
}