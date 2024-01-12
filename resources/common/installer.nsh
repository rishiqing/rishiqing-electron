!macro customInit

  ; 卸载以前的x64版本
  ReadRegStr $R0 HKLM \
  "Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\{821352D5-FB6D-497F-AE11-6A5B5B58A378}_is1" \
  "UninstallString"
  StrCmp $R0 "" done uninstx64

  ; 卸载以前的ia32版本
  ReadRegStr $R1 HKLM \
  "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{821352D5-FB6D-497F-AE11-6A5B5B58A378}_is1" \
  "UninstallString"
  StrCmp $R1 "" done uninstia32

  ;Run the uninstaller
  uninstx64:
    ClearErrors
    ExecWait '$R0 /SILENT _?=$INSTDIR' ;Do not copy the uninstaller to a temp file
   
    IfErrors no_remove_uninstaller_x64 done
      ;You can either use Delete /REBOOTOK in the uninstaller or add some code
      ;here to remove the uninstaller. Use a registry key to check
      ;whether the user has chosen to uninstall. If you are using an uninstaller
      ;components page, make sure all sections are uninstalled.
    no_remove_uninstaller_x64:

  uninstia32:
    ClearErrors
    ExecWait '$R1 /SILENT _?=$INSTDIR' ;Do not copy the uninstaller to a temp file
   
    IfErrors no_remove_uninstaller_ia32 done
      ;You can either use Delete /REBOOTOK in the uninstaller or add some code
      ;here to remove the uninstaller. Use a registry key to check
      ;whether the user has chosen to uninstall. If you are using an uninstaller
      ;components page, make sure all sections are uninstalled.
    no_remove_uninstaller_ia32:
   
  done:
!macroend
