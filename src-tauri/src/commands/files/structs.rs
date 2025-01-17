use serde::{Deserialize, Serialize};
use std::cmp::Ordering;

#[derive(Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum FileType {
    Directory,
    File,
}

#[derive(Serialize, Deserialize)]
pub struct FileNode {
    pub name: String,
    pub file_type: FileType,
    pub full_path: String,
    pub children: Option<Vec<FileNode>>,
}

impl Ord for FileNode {
    fn cmp(&self, other: &Self) -> Ordering {
        match self.file_type.cmp(&other.file_type) {
            Ordering::Equal => self.name.cmp(&other.name),
            other => other,
        }
    }
}

impl PartialOrd for FileNode {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl PartialEq for FileNode {
    fn eq(&self, other: &Self) -> bool {
        self.file_type == other.file_type && self.name == other.name
    }
}

impl Eq for FileNode {}
