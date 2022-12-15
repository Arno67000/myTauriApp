#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{
    CustomMenuItem, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem, Manager
};

mod database;

fn main() {
    let quit = CustomMenuItem::new(String::from("quit"), "Quit");
    let show = CustomMenuItem::new(String::from("show"), "Show");
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    let system_tray = SystemTray::new().with_menu(tray_menu);
    let app = tauri::Builder::default()
    .system_tray(system_tray)
    .on_system_tray_event(|app, event| match event {
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "quit" => {
                std::process::exit(0);
            }
            "show" => {
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
            }
            _ => {}
        },
        _ => {}
    })
    .invoke_handler(tauri::generate_handler![database::set_db, database::user_signup, database::user_login])
    .build(tauri::generate_context!())
    .expect("error while running tauri application");

    app.run(|_app_handle, event| match event {
        tauri::RunEvent::ExitRequested { api, .. } => {
            api.prevent_exit();
        }
        _ => {}
      });
}
