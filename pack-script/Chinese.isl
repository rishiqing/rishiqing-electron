[LangOptions]
; 以下的三条内容非常重要。务必读懂帮助文件中的“[LangOptions] 段”主题。

LanguageName=<7B80><4F53><4E2D><6587>
LanguageID=$0804
LanguageCodePage=936
; 下列条目是用来定义安装程序界面字体的类型及大小的。
; ① 如果只制作简体中文界面的安装程序，使用此默认语言文件即可。
; ② 如果要制作譬如“中/英文”等多语言界面的安装程序，中文语言
;    文件则请改用语言文件夹 Languages 中的 ChineseSimp.isl。从
;    而既可确保在不同语言情况下安装界面大小一致，又能保证在简体
;    中文环境下字体的正常显现。
DialogFontName=宋体
DialogFontSize=9
WelcomeFontName=宋体
WelcomeFontSize=12
TitleFontName=宋体
TitleFontSize=29
CopyrightFontName=宋体
CopyrightFontSize=9
[Messages]
; *** 应用程序标题
SetupAppTitle=安装
SetupWindowTitle=安装 - %1
UninstallAppTitle=卸载
UninstallAppFullTitle=卸载 - %1
; *** 其他公共用信息
InformationTitle=信息
ConfirmTitle=确认
ErrorTitle=错误
; *** 安装加载启动信息
; *** SetupLdr messages
SetupLdrStartupMessage=现在将安装 %1。您想要继续吗?
LdrCannotCreateTemp=不能创建临时文件！安装中断?
LdrCannotExecTemp=不能执行临时目录中的文件！安装中断。

; *** Startup error messages
LastErrorMessage=%1.%n%n错误 %2: %3
SetupFileMissing=安装目录中缺少文件 %1！请纠正该问题，或者获取一个新的程序副本。
SetupFileCorrupt=安装文件已损坏！请获取一个新的程序副本。
SetupFileCorruptOrWrongVer=安装文件已损坏，或者与此安装程序的版本不兼容！请纠正该问题，或者获取一个新的程序副本。
InvalidParameter=一个无效的参数在命令行上传递:%n%n%1
SetupAlreadyRunning=安装程序已经在运行。
WindowsVersionNotSupported=该程序不支持Windows的计算机运行的版本。
WindowsServicePackRequired=此程序需要%1的Service Pack %2或更高。
NotOnThisPlatform=此程序无法在 %1 上运行。
OnlyOnThisPlatform=此程序必须在 %1 上运行。
OnlyOnTheseArchitectures=此程序只能安装在下列处理器结构设计的 Windows 版本上:%n%n%1
MissingWOW64APIs=当前 Windows 版本不包含执行 64 位安装程序所需的功能！要纠正该问题，请安装 Service Pack %1。
WinVersionTooLowError=此程序需要 %1 v%2 或更高版本。
WinVersionTooHighError=此程序不能在 %1 v%2 或更高版本上安装。
AdminPrivilegesRequired=安装此程序时，你必须以管理员身份登录！
PowerUserPrivilegesRequired=安装此程序时，你必须以管理员或 Power Users 成员的身份登录！
SetupAppRunningError=安装程序检测到 %1 正在运行！%n%n请立即关闭其所有实例，然后点击“确定”继续，或者点击“取消”退出。
UninstallAppRunningError=卸载程序检测到 %1 正在运行！%n%n请立即关闭其所有实例，然后点击“确定”继续，或者点击“取消”退出。

; *** Misc. errors
ErrorCreatingDir=安装程序无法创建目录“%1”
ErrorTooManyFilesInDir=无法在目录“%1”中创建文件！因为里面的文件太多

; *** Setup common messages
ExitSetupTitle=退出安装
ExitSetupMessage=安装未完成！如果你现在退出，程序将无法安装！%n%n你可以以后再运行安装程序来完成安装。%n%n要退出安装吗？
AboutSetupMenuItem=关于安装程序(&A)...
AboutSetupTitle=关于安装程序
AboutSetupMessage=%1 版本%2%n%3%n%n%1 主页:%n%4
AboutSetupNote=
TranslatorNote=

; *** Buttons
ButtonBack=< 上一步(&B)
ButtonNext=下一步(&N) >
ButtonInstall=安装(&I)
ButtonOK=确定
ButtonCancel=取消
ButtonYes=是(&Y)
ButtonYesToAll=全是(&A)
ButtonNo=否(&N)
ButtonNoToAll=全否(&O)
ButtonFinish=完成(&F)
ButtonBrowse=浏览(&B)...
ButtonWizardBrowse=浏览(&R)...
ButtonNewFolder=创建新文件夹(&M)

; *** "Select Language" dialog messages
SelectLanguageTitle=选择安装语言
SelectLanguageLabel=请选择安装期间使用的语言:

; *** Common wizard text
ClickNext=点击“下一步”继续，或者点击“取消”退出安装。
BeveledLabel=
BrowseDialogTitle=浏览文件夹
BrowseDialogLabel=在以下列表中选择一个文件夹，然后点击“确定”。
NewFolderName=新建文件夹

; *** "Welcome" wizard page
WelcomeLabel1=欢迎使用 [name] 安装向导
WelcomeLabel2=现在将安装 [name/ver]。%n%n建议你在继续之前关闭其他应用程序。

; *** "Pass<a href="http://www.it165.net/edu/ebg/" target="_blank" class="keylink">word</a>" wizard page
WizardPass<a href="http://www.it165.net/edu/ebg/" target="_blank" class="keylink">word</a>=密码
PasswordLabel1=此安装程序受密码保护！
PasswordLabel3=请输入密码，然后点击“下一步”继续。密码区分大小写！
PasswordEditLabel=密码(&P):
IncorrectPassword=你输入的密码不正确！请重新输入。

; *** "License Agreement" wizard page
WizardLicense=许可协议
LicenseLabel=请在继续之前阅读以下重要信息！
LicenseLabel3=请阅读以下许可协议。你必须接受此协议中的条款，才能继续安装。
LicenseAccepted=我接受(&A)
LicenseNotAccepted=我不接受(&D)

; *** "Information" wizard pages
WizardInfoBefore=信息
InfoBeforeLabel=请在继续之前阅读以下重要信息！
InfoBeforeClickLabel=当你准备继续安装时，请点击“下一步”。
WizardInfoAfter=信息
InfoAfterLabel=请在继续之前阅读以下重要信息！
InfoAfterClickLabel=当你准备继续安装时，请点击“下一步”。

; *** "User Information" wizard page
WizardUserInfo=用户信息
UserInfoDesc=请输入你的信息。
UserInfoName=用户名(&U):
UserInfoOrg=组织(&O):
UserInfoSerial=序列号(&S):
UserInfoNameRequired=你必须输入用户名！

; *** "Select Destination Location" wizard page
WizardSelectDir=选择目标位置
SelectDirDesc=[name] 要安装到哪里？
SelectDirLabel3=安装程序将把 [name] 安装到以下文件夹。
SelectDirBrowseLabel=若要继续，请点击“下一步”。如果你要换一个文件夹，请点击“浏览”。
DiskSpaceMBLabel=至少需要 [mb] MB 可用磁盘空间。
CannotInstallToNetworkDrive=如果你试图安装到网络中，就需要映射一个网络驱动器。
CannotInstallToUNCPath=安装程序不能安装到 UNC 路径！
InvalidPath=你必须输入一个带盘符的完整路径！例如:%n%nC:APP%n%n或者以下格式的 UNC 路径:%n%n\servershare
InvalidDrive=你选择的驱动器或 UNC 路径不存在或者无法访问！请重新选择。
DiskSpaceWarningTitle=磁盘空间不足
DiskSpaceWarning=安装程序至少需要 %1 KB 的可用空间，但是所选驱动器上只剩 %2 KB！%n%n无论如何也要继续吗？
DirNameTooLong=文件夹名称或路径太长！
InvalidDirName=文件夹名称无效！
BadDirName32=文件夹名称不能包含以下字符:%n%n%1
DirExistsTitle=文件夹已存在
DirExists=文件夹:%n%n%1%n%n已存在！无论如何也要安装到此文件夹中吗？
DirDoesntExistTitle=文件夹不存在
DirDoesntExist=文件夹:%n%n%1%n%n不存在！你要创建此文件夹吗？

; *** "Select Components" wizard page
WizardSelectComponents=选择组件
SelectComponentsDesc=要安装那个组件？
SelectComponentsLabel2=请选择你要安装的组件，或者清除不想安装的组件。然后点击“下一步”继续。
FullInstallation=完全安装
CompactInstallation=简洁安装
CustomInstallation=自定义安装
NoUninstallWarningTitle=组件已存在
NoUninstallWarning=安装程序检测到你的电脑中已经安装了下列组件:%n%n%1%n%n取消选择这些组件将不会卸载他们。%n%n无论如何也要继续吗？
ComponentSize1=%1 KB
ComponentSize2=%1 MB
ComponentsDiskSpaceMBLabel=当前所选组件至少需要 [mb] MB 磁盘空间。

; *** "Select Additional Tasks" wizard page
WizardSelectTasks=选择附加任务
SelectTasksDesc=要执行那些附加任务？
SelectTasksLabel2=请选择要在 [name] 安装期间执行的附加任务，然后点击“下一步”。

; *** "Select Start Menu Folder" wizard page
WizardSelectProgramGroup=选择开始菜单文件夹
SelectStartMenuFolderDesc=程序的快捷方式要放到哪里？
SelectStartMenuFolderLabel3=安装程序将在以下开始菜单文件夹中创建程序的快捷方式。
SelectStartMenuFolderBrowseLabel=若要继续，请点击“下一步”。如果你要换一个文件夹，请点击“浏览”。
MustEnterGroupName=你必须输入一个文件夹名称！
GroupNameTooLong=文件夹名称或路径太长！
InvalidGroupName=文件夹名称无效！
BadGroupName=文件夹名称不能包含以下字符:%n%n%1
NoProgramGroupCheck2=禁止创建开始菜单文件夹(&D)

; *** "Ready to Install" wizard page
WizardReady=准备安装
ReadyLabel1=安装程序准备在你的电脑上安装 [name]。
ReadyLabel2a=点击“安装”继续，如果你想修改设置请点击“上一步”。
ReadyLabel2b=点击“安装”继续。
ReadyMemoUserInfo=用户信息:
ReadyMemoDir=目标位置:
ReadyMemoType=安装类型:
ReadyMemoComponents=所选组件:
ReadyMemoGroup=开始菜单文件夹:
ReadyMemoTasks=附加任务:

; *** "Preparing to Install" wizard page
WizardPreparing=正在准备安装
PreparingDesc=安装程序正在准备在你的电脑上安装 [name]。
PreviousInstallNotCompleted=先前的程序还未安装或卸载完成，需要重启电脑来完成。%n%n电脑重启后，再运行安装程序来完成 [name] 的安装。
CannotContinue=安装程序不能继续！请点击“取消”退出。
ApplicationsFound=下面的应用程序正在使用需要由安装更新文件。建议您允许安装程序会自动关闭这些应用程序。
ApplicationsFound2=下面的应用程序正在使用需要由安装更新文件。建议您允许安装程序会自动关闭这些应用程序。在安装完成后，安装程序将尝试重新启动该应用程序。
CloseApplications=自动关闭应用程序(&A)
DontCloseApplications=不要关闭应用程序(&D)
ErrorCloseApplications=安装程序无法自动关闭所有应用程序。建议您使用需要通过安装程序，然后再继续进行更新的文件关闭所有应用程序。

; *** "Installing" wizard page
WizardInstalling=正在安装
InstallingLabel=正在安装 [name]，请稍候...

; *** "Setup Completed" wizard page
FinishedHeadingLabel=[name] 安装完毕
FinishedLabelNoIcons=安装程序已将 [name] 安装到你的电脑上。
FinishedLabel=安装程序已将 [name] 安装到你的电脑上。现在可以通过程序图标来运行应用程序。
ClickFinish=请点击“完成”退出安装。
FinishedRestartLabel=若要完成 [name] 的安装，就必须重启电脑。你要立即重启吗？
FinishedRestartMessage=若要完成 [name] 的安装，就必须重启电脑。%n%n你要立即重启吗？
ShowReadmeCheck=是，我要查看自述文件
YesRadio=是(&Y)，立即重启电脑
NoRadio=否(&N)，稍后重启电脑
; used for example as 'Run MyProg.exe'
RunEntryExec=运行 %1
; used for example as 'View Readme.txt'
RunEntryShellExec=打开 %1

; *** "Setup Needs the Next Disk" stuff
ChangeDiskTitle=安装程序需要下一张磁盘
SelectDiskLabel2=请插入磁盘 %1 后点击“确定”。%n%n如果磁盘上的文件不在以下所显示的文件夹中，就请输入正确的路径或点击“浏览”。
PathLabel=路径(&P):
FileNotInDir2=文件“%1”不在“%2”中！请插入正确的磁盘，或者选择其他文件夹。
SelectDirectoryLabel=请指定下一张磁盘的位置。

; *** Installation phase messages
SetupAborted=安装程序未完成！%n%n请纠正该问题后重新运行安装程序。
EntryAbortRetryIgnore=请点击“重试”再次尝试，点击“忽略”继续，或“中止”取消安装。

; *** Installation status messages
StatusClosingApplications=正在关闭应用程序...
StatusCreateDirs=正在创建目录...
StatusExtractFiles=正在提取文件...
StatusCreateIcons=正在创建快捷方式...
StatusCreateIcons=创建快捷方式...
StatusCreateIniEntries=正在创建 INI 条目...
StatusCreateRegistryEntries=正在创建注册表条目...
StatusRegisterFiles=正在注册文件...
StatusSavingUninstall=正在保存卸载信息...
StatusRunProgram=正在完成安装...
StatusRollback=正在撤销更改...
StatusRestartingApplications=正在重启应用程序...
StatusRollback=回滚更改...

; *** Misc. errors
ErrorInternal2=内部错误: %1
ErrorFunctionFailedNoCode=%1 失败
ErrorFunctionFailed=%1 失败！代码 %2
ErrorFunctionFailedWithMessage=%1 失败！代码 %2.%n%3
ErrorExecutingProgram=无法执行文件:%n%1

; *** Registry errors
ErrorRegOpenKey=打开注册表键出错:%n%1%2
ErrorRegCreateKey=创建注册表键出错:%n%1%2
ErrorRegWriteKey=写入注册表键出错:%n%1%2

; *** INI errors
ErrorIniEntry=在文件“%1”中创建 INI 条目时出错！

; *** File copying errors
FileAbortRetryIgnore=点击“重试”再次尝试，点击“忽略”跳过此文件 (不推荐)，或点击“中止”取消安装。
FileAbortRetryIgnore2=点击“重试”再次尝试，点击“忽略”继续 (不推荐)，或点击“中止”取消安装。
SourceIsCorrupted=源文件已损坏
SourceDoesntExist=源文件“%1”不存在
ExistingFileReadOnly=现有文件已标记为只读。%n%n点击“重试”除去只读属性并再次尝试，点击“忽略”跳过此文件，或点击“中止”取消安装。
ErrorReadingExistingDest=尝试读取现有文件时出错:
FileExists=文件已存在！%n%n要覆盖它吗？
ExistingFileNewer=现有文件比要安装的更新！建议保留现有文件。%n%n要保留现有文件吗？
ErrorChangingAttr=试图更改现有文件的属性时出错:
ErrorCreatingTemp=试图在目标目录中创建文件时出错:
ErrorReadingSource=试图读取源文件时出错:
ErrorCopying=试图复制文件时出错:
ErrorReplacingExistingFile=试图替换现有文件时出错:
ErrorRestartReplace=重启后替换失败:
ErrorRenamingTemp=试图重命名目标目录中的文件时出错:
ErrorRegisterServer=无法注册 DLL/OCX: %1
ErrorRegSvr32Failed=RegSvr32 失败！退出代码 %1
ErrorRegisterTypeLib=无法注册类型库: %1

; *** Post-installation errors
ErrorOpeningReadme=试图打开自述文件时出错！
ErrorRestartingComputer=安装程序无法重启电脑！请手动操作。

; *** Uninstaller messages
UninstallNotFound=文件“%1”不存在！无法卸载
UninstallOpenError=文件“%1”打不开！无法卸载
UninstallUnsupportedVer=卸载日志“%1”的格式无法被此版本的卸载程序识别！无法卸载
UninstallUnknownEntry=卸载日志中遇到未知条目 (%1)
ConfirmUninstall=是否确定要彻底卸载 %1 及其所有组件？
UninstallOnlyOnWin64=此安装只能在 64 位 Windows 上卸载！
OnlyAdminCanUninstall=此安装只能由管理员卸载！
UninstallStatusLabel=正在卸载 %1，请稍候...
UninstalledAll=%1 已成功卸载。
UninstalledMost=%1 卸载完成。%n%n某些元素无法清除，请手动操作。
UninstalledAndNeedsRestart=若要完成 %1 的卸载，就必须重启电脑。%n%n要立即重启吗？
UninstallDataCorrupted=文件“%1”已损坏！无法卸载

; *** Uninstallation phase messages
ConfirmDeleteSharedFileTitle=清楚共享文件吗？
ConfirmDeleteSharedFile2=下列共享文件不再被其他程序使用，要清除吗？%n%n如果其他程序仍然使用此文件，却被删除的话，那些程序可能无法正常运行。如果你不确定，请选择“否”。留下此文件对你的系统也不会有什么损害。
SharedFileNameLabel=文件名:
SharedFileLocationLabel=位置:
WizardUninstalling=卸载状态
StatusUninstalling=正在卸载 %1...

; *** Shutdown block reasons
ShutdownBlockReasonInstallingApp=正在安装 %1.
ShutdownBlockReasonUninstallingApp=正在卸载 %1.

; The custom messages below aren't used by Setup itself, but if you make
; use of them in your scripts, you'll want to translate them.

[CustomMessages]

NameAndVersion=%1 v%2
AdditionalIcons=附加图标:
CreateDesktopIcon=创建桌面图标(&D)
CreateQuickLaunchIcon=创建快速启动图标(&Q)
ProgramOnTheWeb=%1 网站
UninstallProgram=卸载 %1
LaunchProgram=运行 %1
AssocFileExtension=将 %2 文件与 %1 关联(&A)
AssocingFileExtension=正在将 %2 文件与 %1 关联...
AutoStartProgramGroupDescription=启动:
AutoStartProgram=自动启动 %1
AddonHostProgramNotFound=％N％n请问％1无法找到您选择的文件夹中。你要继续吗？