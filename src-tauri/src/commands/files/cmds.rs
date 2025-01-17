use crate::commands::files::structs::{FileNode, FileType};
use std::fs;
use std::io::Read;
use std::path::Path;
use tokio::io;

fn build_file_structure(path: &Path) -> Result<FileNode, std::io::Error> {
    let metadata = fs::metadata(path)?;
    let name = path
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .into_owned();

    if metadata.is_dir() {
        let mut children = Vec::new();
        for entry in fs::read_dir(path)? {
            let entry = entry?;
            let child = build_file_structure(&entry.path())?;
            children.push(child);
        }
        children.sort();
        Ok(FileNode {
            name,
            file_type: FileType::Directory,
            full_path: path.to_str().unwrap().to_string(),
            children: Some(children),
        })
    } else {
        Ok(FileNode {
            name,
            file_type: FileType::File,
            full_path: path.to_str().unwrap().to_string(),
            children: None,
        })
    }
}

fn is_likely_text_file(path: &Path) -> io::Result<bool> {
    let mut file = fs::File::open(path)?;

    let mut buffer = [0; 1024];
    let bytes_read = file.read(&mut buffer)?;

    let non_ascii_count = buffer[..bytes_read]
        .iter()
        .filter(|&&byte| !byte.is_ascii() && !byte.is_ascii_control())
        .count();

    let non_ascii_ratio = non_ascii_count as f32 / bytes_read as f32;
    Ok(non_ascii_ratio < 0.1)
}

#[tauri::command]
pub fn build_upload_structure(path: &Path) -> Result<Vec<FileNode>, String> {
    let mut file_list = Vec::new();
    let node = build_file_structure(path).map_err(|e| e.to_string())?;

    if node.file_type == FileType::File {
        if is_likely_text_file(Path::new(&node.full_path)).map_err(|e| e.to_string())? {
            file_list.push(FileNode {
                name: node.name,
                file_type: node.file_type,
                full_path: node.full_path,
                children: None,
            });
            return Ok(file_list);
        } else {
            println!("{} not a text file", node.name);
            return Err("Not a text file".to_string());
        }
    }

    if let Some(children) = node.children {
        let skip_names = [
            ".git",
            "node_modules",
            "dist",
            "build",
            "target",
            ".venv",
            "env",
            ".vscode",
            ".pytest_cache",
            "logs",
            "tmp",
            "temp",
            "public",
            "out",
            ".next",
        ];
        let skip_files = [
            ".DS_Store",
            "Thumbs.db",
            ".env",
            ".eslintcache",
            ".prettiercache",
            "package-lock.json",
            "yarn.lock",
            "Cargo.lock",
            "Pipfile.lock",
        ];

        if skip_names.contains(&node.name.as_str()) {
            return Ok(file_list);
        }

        for child in children {
            if skip_files.contains(&child.name.as_str()) {
                continue;
            }
            match build_upload_structure(Path::new(&child.full_path)) {
                Ok(mut child_files) => file_list.append(&mut child_files),
                Err(_) => continue,
            }
        }

        if file_list.is_empty() {
            Err("Empty directory after filtering".to_string())
        } else {
            Ok(file_list)
        }
    } else {
        Ok(file_list)
    }
}

#[tauri::command]
pub fn get_file_structure(path: String) -> Result<FileNode, String> {
    build_file_structure(Path::new(&path)).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_line_numbers(text: &str) -> String {
    text.lines()
        .enumerate()
        .map(|(i, line)| format!("{:4} {}", i + 1, line))
        .collect::<Vec<String>>()
        .join("\n")
}
