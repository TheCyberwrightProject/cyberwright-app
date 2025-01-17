pub mod api;
pub mod commands;
pub mod constants;

use commands::ai::{init_upload, upload_file, scan_upload, get_diagnostics};
use commands::auth::{generate_auth_url, login, logout, signup, validate_token, google_auth};
use commands::files::cmds::{
    add_line_numbers, build_upload_structure, get_file_structure, read_file,
};
use commands::settings::get_account_info;
use std::sync::Arc;
use tauri::{EventLoopMessage, Manager, State};
use tauri_plugin_single_instance;
use tauri_plugin_store::{Store, StoreBuilder};
use tauri_runtime_wry::Wry;
use tokio::sync::Mutex;

pub struct AppData {
    token_store: Arc<Store<Wry<EventLoopMessage>>>,
}
pub type AppState<'r> = State<'r, Mutex<AppData>>;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_single_instance::init(|_, _, _| {}))
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_oauth::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            let token_store = StoreBuilder::new(app, ".token.bin")
                .build()
                .expect("Failed to build token store");
            app.manage(Mutex::new(AppData {
                token_store: token_store,
            }));

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_file_structure,
            read_file,
            build_upload_structure,
            add_line_numbers,
            validate_token,
            login,
            signup,
            get_account_info,
            logout,
            generate_auth_url,
            google_auth,
            init_upload,
            upload_file,
            scan_upload,
            get_diagnostics
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
