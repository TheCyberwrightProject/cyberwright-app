use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Deserialize, Serialize)]
pub struct ValidateResponse {
    pub valid: bool,
}

#[derive(Deserialize, Serialize)]
pub struct SignupData {
    pub name: String,
    pub email: String,
    pub password: String,
}

#[derive(Deserialize, Serialize)]
pub struct LoginData {
    pub email: String,
    pub password: String,
}

#[derive(Deserialize, Serialize)]
pub struct GoogleAuth {
    pub code: String,
    pub redirect_uri: String,
}

#[derive(Deserialize, Serialize)]
pub struct AuthResponse {
    pub access_token: String,
}

#[derive(Deserialize, Serialize)]
pub struct AiResponse {
    pub diagnostics: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct UploadSessionInit {
    pub uid: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct FileUploadRes {
    pub uploaded: bool,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct ScanUploadRes {
    pub position: i32,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct DiagnosticsRes {
    pub status: String,
    pub diagnostics: Option<Vec<Diagnostic>>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Diagnostic {
    pub file_path: String,
    pub file_name: String,
    pub line_number: i32,
    pub vulnerability: String,
    pub severity: String,
    pub reasoning: String,
}

#[derive(Deserialize, Debug)]
pub struct ErrorResponse {
    pub status: i32,
    pub error: String,
}

#[derive(Deserialize, Error, Debug)]
pub enum APIErrorResponse {
    #[error("Request failed with status: {0}")]
    RequestFailed(String),

    #[error("User is not authenticated")]
    InvalidToken,

    #[error("{0}")]
    RequestErrored(String),

    #[error("Failed to deserialize response")]
    DeserializeError,

    #[error("Unknown error occurred")]
    Unknown,
}
