use sqlite;
use std::path::PathBuf;

pub struct DataBase {
    pub file_path: PathBuf,
}

#[derive(Debug)]
pub enum DatabaseError {
    DbErr(sqlite::Error),
}

impl From<sqlite::Error> for DatabaseError {
    fn from(err: sqlite::Error) -> Self {
        DatabaseError::DbErr(err)
    }
}

impl DataBase {

    pub fn set(s:&Self) -> Result<(), DatabaseError> {
        let connection = sqlite::open(&s.file_path)?;
        connection.execute("create table if not exists users (name text PRIMARY KEY, password text not null);")?;
        Ok(())
    }

    pub fn get(s:&Self) -> Result<Option<String>, DatabaseError> {
        let connection = sqlite::open(&s.file_path)?;
        let mut res = connection.prepare("select * from users;")?;
        if let sqlite::State::Row = res.next()? {
            let username = res.read::<String>(0)?;
            Ok(Some(username))
        }else {
            println!("No User Found");
            Ok(None)
        }
    }

    pub fn login(s:&Self, password: &str) -> Result<bool, DatabaseError> {
        let connection = sqlite::open(&s.file_path)?;
        let mut res = connection.prepare("select * from users where password = ?;")?.bind(1, password)?;
        if let sqlite::State::Row = res.next()? {
            Ok(true)
        } else {
            Ok(false)
        }
    }
    pub fn signup(s:&Self, name: &str, password: &str) -> Result<(), DatabaseError> {
        let connection = sqlite::open(&s.file_path)?;
        connection
            .prepare("insert into users (name, password) values (?, ?);")?
            .bind(1, name)?
            .bind(2, password)?
            .next()?;
        Ok(())
    }

}

fn prepare_db(app_handle: tauri::AppHandle) -> DataBase {
    DataBase {
        file_path: app_handle.path_resolver().resolve_resource("../database/data.db").expect("Couldn't resolve database localisation"),
    }
}

#[tauri::command]
pub fn set_db(app_handle: tauri::AppHandle) -> Option<String> {
    let db = prepare_db(app_handle);

    match DataBase::set(&db) {
        Ok(_) => println!("DATABASE READY"),
        Err(DatabaseError::DbErr(ref e)) => println!("DB INIT FAILED: {:?}", e),
    }

    match DataBase::get(&db) {
        Ok(user) => user,
        Err(DatabaseError::DbErr(ref e)) => {
            println!("DB ERROR ON GET USERS : {:?}", e);
            None
        },
    }
}

#[tauri::command]
pub fn user_signup(app_handle: tauri::AppHandle, name: &str, password: &str) -> bool {
    let db = prepare_db(app_handle);

    match DataBase::signup(&db, name, password) {
        Ok(_) => true,
        Err(DatabaseError::DbErr(ref e)) => {
            println!("SIGNUP FAILED : {:?}", e);
            false
        }
    }
}

#[tauri::command]
pub fn user_login(app_handle: tauri::AppHandle, password: &str) -> bool {
    let db = prepare_db(app_handle);

    match DataBase::login(&db, password) {
        Ok(res) => res,
        Err(DatabaseError::DbErr(ref e)) => {
            println!("LOGIN FAILED : {:?}", e);
            false
        }
    }
}
