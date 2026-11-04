; ============================================================================
; Course Ahead CCNA Labs — Windows Setup v2 (NSIS, FILE-BASED)
; Publisher: Raja Huwaris Usmani. Copyright (C) 2026 Raja Huwaris Usmani.
;
; File-based payload: the win-unpacked app tree is embedded as individual
; files (File /r) and NSIS itself writes them out — plain file copy, no 7z
; extraction anywhere (the v1 7z extraction failed on the user's PC).
; WriteUninstaller generates the uninstaller on the user's own machine at
; install time. Installs per-machine to Program Files (admin), matching the
; original Setup v2 behaviour.
;
; Build (Linux, native makensis from the electron-builder cache):
;   makensis installer-filebased.nsi
; ============================================================================

Unicode True

!ifndef NSIS_ROOT
  !define NSIS_ROOT "/home/hatch/.cache/electron-builder/nsis/nsis-3.0.4.1"
!endif
!addincludedir "${NSIS_ROOT}/Include"

!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "x64.nsh"

!define APP_NAME "Course Ahead CCNA Labs"
!define APP_EXE "Course Ahead CCNA Labs.exe"
!define UNINST_EXE "Uninstall Course Ahead CCNA Labs.exe"
!define PUBLISHER "Raja Huwaris Usmani"
!define VERSION "1.0.0"
!define UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\CourseAheadCCNALabs"
!define PAYLOAD_DIR "dist/win-unpacked"

Name "${APP_NAME}"
Caption "${APP_NAME} Setup"
OutFile "dist/Course-Ahead-CCNA-Labs-Setup-v2.exe"
InstallDir "$PROGRAMFILES64\${APP_NAME}"
InstallDirRegKey HKLM "Software\CourseAhead\CCNALabs" "InstallDir"
RequestExecutionLevel admin
SetCompressor lzma ; non-solid: solid LZMA bus-errors on this build VM when memory is tight (2026-11-02)
Icon "build/icon.ico"
UninstallIcon "build/icon.ico"

VIProductVersion "1.0.0.0"
VIAddVersionKey /LANG=1033 "ProductName" "${APP_NAME}"
VIAddVersionKey /LANG=1033 "CompanyName" "${PUBLISHER}"
VIAddVersionKey /LANG=1033 "FileDescription" "Course Ahead CCNA Labs — free CCNA labs by Raja Huwaris Usmani"
VIAddVersionKey /LANG=1033 "LegalCopyright" "© 2026 Raja Huwaris Usmani — All Rights Reserved"
VIAddVersionKey /LANG=1033 "FileVersion" "${VERSION}"
VIAddVersionKey /LANG=1033 "ProductVersion" "${VERSION}"

!define MUI_ICON "build/icon.ico"
!define MUI_UNICON "build/icon.ico"
!define MUI_ABORTWARNING

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

Section "Install" SEC01
  ; --- install the app payload: plain file copy of the whole win-unpacked
  ;     tree (NSIS File /r recreates the directory structure under $INSTDIR).
  ;     No archive extraction, no external plugins. ---
  SetOutPath "$INSTDIR"
  File /r "${PAYLOAD_DIR}\*.*"

  ; --- shortcuts (desktop + Start Menu), icon = the app exe's stamped RHU icon ---
  CreateShortcut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE}" "" "$INSTDIR\${APP_EXE}" 0
  CreateDirectory "$SMPROGRAMS\${APP_NAME}"
  CreateShortcut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE}" "" "$INSTDIR\${APP_EXE}" 0
  CreateShortcut "$SMPROGRAMS\${APP_NAME}\Uninstall ${APP_NAME}.lnk" "$INSTDIR\${UNINST_EXE}" "" "$INSTDIR\${UNINST_EXE}" 0

  ; --- uninstaller, generated here on the user's machine ---
  WriteUninstaller "$INSTDIR\${UNINST_EXE}"

  ; --- Add/Remove Programs registration ---
  ${If} ${RunningX64}
    SetRegView 64
  ${EndIf}
  WriteRegStr HKLM "Software\CourseAhead\CCNALabs" "InstallDir" "$INSTDIR"
  WriteRegStr HKLM "${UNINST_KEY}" "DisplayName" "${APP_NAME}"
  WriteRegStr HKLM "${UNINST_KEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKLM "${UNINST_KEY}" "Publisher" "${PUBLISHER}"
  WriteRegStr HKLM "${UNINST_KEY}" "DisplayIcon" "$INSTDIR\${APP_EXE}"
  WriteRegStr HKLM "${UNINST_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKLM "${UNINST_KEY}" "UninstallString" '"$INSTDIR\${UNINST_EXE}"'
  WriteRegStr HKLM "${UNINST_KEY}" "QuietUninstallString" '"$INSTDIR\${UNINST_EXE}" /S'
  WriteRegDWORD HKLM "${UNINST_KEY}" "NoModify" 1
  WriteRegDWORD HKLM "${UNINST_KEY}" "NoRepair" 1
  ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
  IntFmt $0 "0x%08X" $0
  WriteRegDWORD HKLM "${UNINST_KEY}" "EstimatedSize" "$0"
SectionEnd

Section "Uninstall"
  ${If} ${RunningX64}
    SetRegView 64
  ${EndIf}
  Delete "$DESKTOP\${APP_NAME}.lnk"
  Delete "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk"
  Delete "$SMPROGRAMS\${APP_NAME}\Uninstall ${APP_NAME}.lnk"
  RMDir "$SMPROGRAMS\${APP_NAME}"
  DeleteRegKey HKLM "${UNINST_KEY}"
  DeleteRegKey HKLM "Software\CourseAhead\CCNALabs"
  RMDir /r "$INSTDIR"
SectionEnd
