; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

#define MyAppName "日事清"
#define MyAppVersion "2.1.6"
#define MyAppPublisher "北京创仕科锐信息技术有限责任公司"
#define MyAppURL "https://www.rishiqing.com/"
#define MyAppExeName "rishiqing.exe"
#define SourceDir "..\package\release-ia32\rishiqing-win32-ia32"
#define OutputFileName "日事清-release-win-ia32"

[Code]
// 安装前检查关闭**进程
function InitializeSetup():Boolean;
//进程ID
var ResultStr: String; ResultCode: Integer; ResultCode1: Integer;  
begin
  Result := true;
  Exec(ExpandConstant('{cmd}'), '/C taskkill /IM {#MyAppExeName} /F', '', SW_HIDE, ewWaitUntilTerminated, ResultCode1);
  // 这个卸载程序要注意，在32位机子上的代码不一样
  if RegQueryStringValue(HKLM, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{821352D5-FB6D-497F-AE11-6A5B5B58A378}_is1', 'UninstallString', ResultStr) then  
    begin  
      ResultStr := RemoveQuotes(ResultStr);  
      Exec(ResultStr, '/silent', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);  
    end;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var ResultCode1: Integer;
begin
  Exec(ExpandConstant('{cmd}'), '/C taskkill /IM {#MyAppExeName} /F', '', SW_HIDE, ewWaitUntilTerminated, ResultCode1);
  if CurUninstallStep = usUninstall then
  RegDeleteValue(HKEY_CURRENT_USER, 'Software\Microsoft\Windows\CurrentVersion\Run', 'rishiqing_startOnBoot');
end;

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{821352D5-FB6D-497F-AE11-6A5B5B58A378}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={pf}\rishiqing
DefaultGroupName={#MyAppName}
OutputDir=..\pack
OutputBaseFilename={#OutputFileName}-{#MyAppVersion}
SetupIconFile=256x256.ico
UninstallDisplayIcon={app}\{#MyAppExeName}

[Languages]
Name: "Chinese"; MessagesFile: "compiler:Chinese.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "{#SourceDir}\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
