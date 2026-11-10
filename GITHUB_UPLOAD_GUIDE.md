# Step-by-Step GitHub Upload Guide

This folder (`Farmer-Subsidy-Blockchain-GitHub`) has been completely prepared and cleaned for uploading directly to GitHub. All unwanted build artifacts, temporary caches, bulky `node_modules`, test documents, and sensitive passwords have been stripped out.

---

## Method 1: Upload via Git Command Line (Recommended & Fastest)

### Step 1: Open Terminal in this folder
Open PowerShell or Command Prompt, and navigate to this folder:
```powershell
cd d:\Farmer-Subsidy-Blockchain-GitHub
```

### Step 2: Initialize Git & Commit
```powershell
git init
git add .
git commit -m "Initial commit: Blockchain-Based Farmer Subsidy Distribution System (KrishiSubsidy Portal)"
```

### Step 3: Link to your GitHub Repository
1. Go to [GitHub.com](https://github.com/) and click **New Repository**.
2. Name your repository (e.g., `Farmer-Subsidy-Blockchain` or `krishisubsidy-portal`).
3. Set visibility to **Public** or **Private** (do **NOT** check "Initialize with README", "Add .gitignore", or "Add license" because this folder already includes all of them).
4. Click **Create repository**.
5. Copy your repository's URL (e.g., `https://github.com/<your-username>/Farmer-Subsidy-Blockchain.git`).

### Step 4: Push to GitHub
```powershell
git branch -M main
git remote add origin https://github.com/<your-username>/Farmer-Subsidy-Blockchain.git
git push -u origin main
```
*(If prompted, log in with your GitHub credentials or Personal Access Token.)*

---

## Method 2: Upload via GitHub Desktop (No Command Line Needed)

1. Open **GitHub Desktop**.
2. Click **File** -> **Add Local Repository...** (or press `Ctrl + O`).
3. Click **Choose...** and select `d:\Farmer-Subsidy-Blockchain-GitHub`.
4. If it prompts that this directory is not a Git repository, click **Create a Repository here...**.
5. Give it a name and click **Create Repository**.
6. Click the blue **Publish repository** button at the top.
7. Uncheck "Keep this code private" if you want it visible to evaluators/professors, and click **Publish repository**.

---

## Method 3: Drag & Drop via GitHub Web UI

1. Go to [GitHub.com](https://github.com/) -> **New Repository**.
2. Enter repository name and click **Create repository**.
3. Under the "Quick setup" section, click the link **"uploading an existing file"**.
4. Drag and drop all the files and folders from `d:\Farmer-Subsidy-Blockchain-GitHub` directly into the upload area.
5. Enter a commit message (e.g., `Initial commit`) and click **Commit changes**.
