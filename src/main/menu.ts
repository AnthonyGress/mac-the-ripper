import {
    app,
    Menu,
    shell,
    BrowserWindow,
    MenuItemConstructorOptions,
} from 'electron';
import { platform } from 'os';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

export default class MenuBuilder {
    mainWindow: BrowserWindow;

    constructor(mainWindow: BrowserWindow) {
        this.mainWindow = mainWindow;
    }

    buildMenu(): Menu {
        if (
            process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
        ) {
            this.setupDevelopmentEnvironment();
        }

        const template =
      process.platform === 'darwin'
          ? this.buildDarwinTemplate()
          : this.buildDefaultTemplate();

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);

        return menu;
    }

    setupDevelopmentEnvironment(): void {
        this.mainWindow.webContents.on('context-menu', (_, props) => {
            const { x, y } = props;

            Menu.buildFromTemplate([
                {
                    label: 'Inspect element',
                    click: () => {
                        this.mainWindow.webContents.inspectElement(x, y);
                    },
                },
            ]).popup({ window: this.mainWindow });
        });
    }

    unixUpdate(): any {
        const updateMenu = {
            label: 'Update Youtube Downloader',
            click: () => {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const { exec } = require('child_process');
                console.log('running update');
                exec('/bin/bash -c "$(curl -sL https://raw.githubusercontent.com/AnthonyGress/youtube-dl/main/install.sh)"',
                    (err: string, stdout: string, stderr: string) => {
                        this.mainWindow.webContents.send('startup', `stdout: ${stdout}`)
                        this.mainWindow.webContents.send('startup', `stderr: ${stderr}`)
                        console.log(`stdout: ${stdout}`);
                        console.log(`stderr: ${stderr}`);
                    })

            }
        }

        if (platform() === 'darwin' || platform() === 'linux'){
            return updateMenu;
        }
    }

    buildDarwinTemplate(): MenuItemConstructorOptions[] {
        const subMenuAbout: DarwinMenuItemConstructorOptions = {
            label: 'Youtube Downloader',
            submenu: [
                {
                    label: 'About Youtube Downloader',
                    selector: 'orderFrontStandardAboutPanel:',
                },
                this.unixUpdate(),
                { type: 'separator' },
                { label: 'Services', submenu: [] },
                { type: 'separator' },
                {
                    label: 'Hide Youtube Downloader',
                    accelerator: 'Command+H',
                    selector: 'hide:',
                },
                {
                    label: 'Hide Others',
                    accelerator: 'Command+Shift+H',
                    selector: 'hideOtherApplications:',
                },
                { label: 'Show All', selector: 'unhideAllApplications:' },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: () => {
                        app.quit();
                    },
                },
            ],
        };
        const subMenuEdit: DarwinMenuItemConstructorOptions = {
            label: 'Edit',
            submenu: [
                { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
                { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
                { type: 'separator' },
                { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
                { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
                { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
                {
                    label: 'Select All',
                    accelerator: 'Command+A',
                    selector: 'selectAll:',
                },
            ],
        };
        const subMenuViewDev: MenuItemConstructorOptions = {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'Command+R',
                    click: () => {
                        this.mainWindow.webContents.reload();
                    },
                },
                {
                    label: 'Toggle Full Screen',
                    accelerator: 'Ctrl+Command+F',
                    click: () => {
                        this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
                    },
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: 'Alt+Command+I',
                    click: () => {
                        this.mainWindow.webContents.toggleDevTools();
                    },
                },
            ],
        };
        const subMenuViewProd: MenuItemConstructorOptions = {
            label: 'View',
            submenu: [
                {
                    label: 'Toggle Full Screen',
                    accelerator: 'Ctrl+Command+F',
                    click: () => {
                        this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
                    },
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: 'Alt+Command+I',
                    click: () => {
                        this.mainWindow.webContents.toggleDevTools();
                    },
                },
            ],
        };
        const subMenuWindow: DarwinMenuItemConstructorOptions = {
            label: 'Window',
            submenu: [
                {
                    label: 'Minimize',
                    accelerator: 'Command+M',
                    selector: 'performMiniaturize:',
                },
                { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
                { type: 'separator' },
                { label: 'Bring All to Front', selector: 'arrangeInFront:' },
            ],
        };
        const subMenuHelp: MenuItemConstructorOptions = {
            label: 'Help',
            submenu: [
                {
                    label: 'Learn More',
                    click() {
                        shell.openExternal('https://electronjs.org');
                    },
                },
                {
                    label: 'Documentation',
                    click() {
                        shell.openExternal(
                            'https://github.com/electron/electron/tree/main/docs#readme'
                        );
                    },
                },
                {
                    label: 'Community Discussions',
                    click() {
                        shell.openExternal('https://www.electronjs.org/community');
                    },
                },
                {
                    label: 'Search Issues',
                    click() {
                        shell.openExternal('https://github.com/electron/electron/issues');
                    },
                },
            ],
        };

        const subMenuView =
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
          ? subMenuViewDev
          : subMenuViewProd;

        return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
    }

    buildDefaultTemplate() {
        const templateDefault = [
            {
                label: '&File',
                submenu: [
                    {
                        label: '&Open',
                        accelerator: 'Ctrl+O',
                    },
                    {
                        label: '&Close',
                        accelerator: 'Ctrl+W',
                        click: () => {
                            this.mainWindow.close();
                        },
                    },
                ],
            },
            {
                label: '&View',
                submenu:
          process.env.NODE_ENV === 'development' ||
          process.env.NODE_ENV === 'production'
              ? [
                  {
                      label: '&Reload',
                      accelerator: 'Ctrl+R',
                      click: () => {
                          this.mainWindow.webContents.reload();
                      },
                  },
                  {
                      label: 'Toggle &Full Screen',
                      accelerator: 'F11',
                      click: () => {
                          this.mainWindow.setFullScreen(
                              !this.mainWindow.isFullScreen()
                          );
                      },
                  },
                  {
                      label: 'Toggle &Developer Tools',
                      accelerator: 'Alt+Ctrl+I',
                      click: () => {
                          this.mainWindow.webContents.toggleDevTools();
                      },
                  },
              ]
              : [
                  {
                      label: 'Toggle &Full Screen',
                      accelerator: 'F11',
                      click: () => {
                          this.mainWindow.setFullScreen(
                              !this.mainWindow.isFullScreen()
                          );
                      },
                  },
                  {
                      label: 'Toggle &Developer Tools',
                      accelerator: 'Alt+Ctrl+I',
                      click: () => {
                          this.mainWindow.webContents.toggleDevTools();
                      },
                  },
              ],
            },
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'Learn More',
                        click() {
                            shell.openExternal('https://electronjs.org');
                        },
                    },
                    {
                        label: 'Documentation',
                        click() {
                            shell.openExternal(
                                'https://github.com/electron/electron/tree/main/docs#readme'
                            );
                        },
                    },
                    {
                        label: 'Community Discussions',
                        click() {
                            shell.openExternal('https://www.electronjs.org/community');
                        },
                    },
                    {
                        label: 'Search Issues',
                        click() {
                            shell.openExternal('https://github.com/electron/electron/issues');
                        },
                    },
                ],
            },
        ];

        return templateDefault;
    }
}
