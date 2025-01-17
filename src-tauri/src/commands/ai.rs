use std::fs;

use crate::{api::{responses::{APIErrorResponse, AiResponse, Diagnostic, DiagnosticsRes, ErrorResponse, FileUploadRes, ScanUploadRes, UploadSessionInit}, utils::{api_request, get_access_token}}, commands::files::cmds::{add_line_numbers, read_file}};
use reqwest::multipart::Part;
use serde::Serialize;
use tauri::http::{HeaderMap, HeaderValue};
use crate::{api::utils::ReqType, constants::API_BASE, AppState};
use super::files::structs::FileNode;

#[derive(Serialize)]
struct AiInput {
    input: String
}

#[derive(Serialize)]
struct AiScanInput {
    uid: String
}

#[derive(Serialize)]
struct InitUploadInput {
    dir_name: String,
    num_files: i32
}

#[tauri::command]
pub async fn init_upload(dir_name: String, num_files: i32, state: AppState<'_>) -> Result<String, String> {
    let api_url = format!("{}/ai/initUploadSession", API_BASE);
    let res = api_request::<UploadSessionInit>(api_url, true, ReqType::POST, Some(InitUploadInput {
        dir_name: dir_name,
        num_files: num_files
    }), &state).await;

    match res {
        Ok(res) => Ok(res.uid),
        Err(err) => {
            return Err(err.to_string());
        }
    }  
}

#[tauri::command]
pub async fn upload_file(file: FileNode, uid: String, state: AppState<'_>) -> Result<(), String> {
    let api_url = format!("{}/ai/uploadFile", API_BASE);

    let content = fs::read(file.full_path.clone()).map_err(|e| e.to_string())?;
    let part = Part::bytes(content).file_name(file.name);
    let form = reqwest::multipart::Form::new()
        .text("uid", uid)
        .text("path", file.full_path)
        .part("file", part);
        
    let client = reqwest::Client::new();

    let token = get_access_token(&state).await;
    if token.is_none() {
        return Err(APIErrorResponse::InvalidToken.to_string());
    }
    let mut headers = HeaderMap::new();
    headers.insert(
        "Authorization",
        HeaderValue::from_str(&format!("Bearer {}", token.unwrap()))
            .map_err(|_| APIErrorResponse::Unknown.to_string())?,
    );

    let res = client
        .post(api_url)
        .headers(headers)
        .multipart(form)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        let res_convert: Result<FileUploadRes, _> = res.json().await;

        match res_convert {
            Ok(_) => Ok(()),
            Err(_) => Err(APIErrorResponse::DeserializeError.to_string()),
        }
    } else {
        let error_response: Result<ErrorResponse, _> = res.json().await;

        match error_response {
            Ok(err) => Err(APIErrorResponse::RequestErrored(err.error).to_string()),
            Err(_) => Err(APIErrorResponse::Unknown.to_string()),
        }
    }
}

#[tauri::command]
pub async fn scan_upload(uid: String, state: AppState<'_>) -> Result<String, String> {
    let api_url = format!("{}/ai/scanUpload", API_BASE);
    let res = api_request::<ScanUploadRes>(api_url, true, ReqType::POST, Some(AiScanInput {
        uid: uid
    }), &state).await;

    match res {
        Ok(res) => Ok(res.position.to_string()),
        Err(err) => {
            return Err(err.to_string());
        }
    }    
}

#[tauri::command]
pub async fn get_diagnostics(uid: String, state: AppState<'_>) -> Result<(String, Option<Vec<Diagnostic>>), String> {
    let api_url = format!("{}/ai/getDiagnostics", API_BASE);
    let res = api_request::<DiagnosticsRes>(api_url, true, ReqType::POST, Some(AiScanInput {
        uid: uid
    }), &state).await;

    match res {
        Ok(res) => Ok((res.status, res.diagnostics)),
        Err(err) => {
            return Err(err.to_string());
        }
    }    
}
