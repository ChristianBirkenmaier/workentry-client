const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const axios = require("axios");
const regeneratorRuntime = require("regenerator-runtime");
const isDev = require("electron-is-dev");

// if (isDev) {
// 	console.log('Running in development');
// } else {
// 	console.log('Running in production');
// }
// const { db, message } = require("./db")();
// const { Workentry, Category, Project } = require("./models");
// const mongoose = require("mongoose");

let CATEGORY_URL;
let PROJECT_URL;
let WORKENTRY_URL;

if (isDev) {
  CATEGORY_URL = `${process.env.DEV_URL}/api/v1/category/`;
  PROJECT_URL = `${process.env.DEV_URL}/api/v1/project/`;
  WORKENTRY_URL = `${process.env.DEV_URL}/api/v1/workentry/`;
} else {
  CATEGORY_URL = `${process.env.PROD_URL}/api/v1/category/`;
  PROJECT_URL = `${process.env.PROD_URL}/api/v1/project/`;
  WORKENTRY_URL = `${process.env.PROD_URL}/api/v1/workentry/`;
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  console.log("MAIN_WINDOW_WEBPACK_ENTRY", MAIN_WINDOW_WEBPACK_ENTRY);
  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  if (isDev) {
    console.log("Running in development");
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  }

  handleListeners();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function handleListeners() {
  ipcMain.on("isDev:req", sendIsDev);
  ipcMain.on("message:req", () => {
    message = [];
    console.log("Message: ", message);
    mainWindow.webContents.send("message:res", message);
  });

  ipcMain.on("workentries:load", sendWorkentries);

  ipcMain.on("workentrycreate:load", sendWorkentrycreate);

  ipcMain.on("categories:load", loadCategories);
  ipcMain.on("projects:load", loadProjects);
  ipcMain.on("workentrycreate:new", sendNewWorkentry);
}

function sendIsDev() {
  mainWindow.webContents.send("isDev:res", isDev);
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

async function loadCategories() {
  try {
    console.log("loadCategories");
    let categories;
    // categories = await Category.find();
    categories = await axios.get(CATEGORY_URL);
    if (!categories) {
      categories = [
        { _id: "0123", categoryName: "Bli" },
        { _id: "2345", categoryName: "Bla" },
      ];
    }
    console.log("categories", categories.data);
    mainWindow.webContents.send("categories:get", JSON.stringify(categories));
  } catch (err) {
    console.error(err);
    mainWindow.webContents.send("message:res", [err.message]);
  }
}

async function loadProjects() {
  try {
    console.log("loadProjects");
    let projects;
    projects = await axios.get(PROJECT_URL);
    // projects = await Project.find();
    if (!projects) {
      projects = [
        { _id: "12521", projectName: "kjsafsaf" },
        { _id: "dasd2", projectName: "asfsaf" },
      ];
    }
    console.log("projects", projects.data);
    mainWindow.webContents.send("projects:get", JSON.stringify(projects));
  } catch (err) {
    console.error(err);
    mainWindow.webContents.send("message:res", [err.message]);
  }
}

async function sendWorkentrycreate() {
  try {
    return;
    const [fetched_categories, fetched_projects] = await Promise.all([axios.get(CATEGORY_URL), axios.get(PROJECT_URL)]);
    // .then(([fetched_categories, fetched_projects]) => {
    //     mainWindow.webContents.send(
    //         "workentrycreate:get",
    //         JSON.stringify({ categories: fetched_categories.data, projects: fetched_projects.data })
    //     );
    // })
    // .catch((err) => console.error(err));
    mainWindow.webContents.send(
      "workentrycreate:get",
      JSON.stringify({
        categories: fetched_categories.data,
        projects: fetched_projects.data,
      })
    );
  } catch (err) {
    console.error(err);
  }
}

async function sendWorkentries() {
  try {
    const workentries = await axios.get(WORKENTRY_URL);
    mainWindow.webContents.send("workentries:get", JSON.stringify(workentries.data));
  } catch (err) {
    console.error(err);
  }
}

async function sendNewWorkentry(e, w) {
  try {
    // await axios.post(WORKENTRY_URL, {
    //     id: w.id,
    // projectName: w.projectName,
    // categoryName: w.categoryName,
    // fromDate: w.fromDate,
    // untilDate: w.untilDate,
    // optionalText: w.optionalText,
    // });
    console.info("w: ", w);
    const workentry = new Workentry({
      projectName: mongoose.Types.ObjectId(w.projectName),
      categoryName: mongoose.Types.ObjectId(w.categoryName),
      fromDate: w.fromDate,
      untilDate: w.untilDate,
      optionalText: w.optionalText,
    });
    console.info("workentry", workentry);
    const saved = await workentry.save();
    console.log("saved", saved);
    mainWindow.webContents.send("workentrycreate:created");
    // sendWorkentries();
  } catch (err) {
    mainWindow.webContents.send("workentrycreate:failed");
    console.error(err);
  }
}
