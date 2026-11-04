; ============================================================================
; Course Ahead CCNA Labs — Windows Setup (NSIS)
; Publisher: Raja Huwaris Usmani. Copyright (C) 2026 Raja Huwaris Usmani.
;
; Why hand-written: electron-builder's NSIS flow pre-generates the uninstaller
; by RUNNING the installer under wine (only so it can be signed). This machine
; cannot execute 32-bit binaries at all (the ia32 loader segfaults), so the
; classic NSIS flow is used instead: WriteUninstaller generates the uninstaller
; on the user's own Windows machine at install time. No wine, no signing step.
; The app payload is electron-builder's own .nsis.7z archive of the stamped
; win-unpacked build, extracted with the Nsis7z plugin — the same mechanism
; electron-builder's template uses (see extractAppPackage.nsh).
;
; Build (Linux, native makensis from the electron-builder cache):
;   makensis installer.nsi
; ============================================================================

Unicode True

!ifndef NSIS_ROOT
  !define NSIS_ROOT "/home/hatch/.cache/electron-builder/nsis/nsis-3.0.4.1"
!endif
!ifndef NSIS_RES
  !define NSIS_RES "/home/hatch/.cache/electron-builder/nsis/nsis-resources-3.4.1"
!endif
!addincludedir "${NSIS_ROOT}/Include"
!addplugindir "${NSIS_ROOT}/Plugins/x86-unicode"
!addplugindir "${NSIS_RES}/plugins/x86-unicode"

!include "MUI2.nsh"
!include "FileFunc.nsh"

!define APP_NAME "Course Ahead CCNA Labs"
!define APP_EXE "Course Ahead CCNA Labs.exe"
!define UNINST_EXE "Uninstall Course Ahead CCNA Labs.exe"
!define PUBLISHER "Raja Huwaris Usmani"
!define VERSION "1.0.0"
!define UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\CourseAheadCCNALabs"
!define PAYLOAD "dist/course-ahead-ccna-labs-1.0.0-x64.nsis.7z"

Name "${APP_NAME}"
Caption "${APP_NAME} Setup"
OutFile "dist/Course-Ahead-CCNA-Labs-Setup.exe"
InstallDir "$LOCALAPPDATA\Programs\${APP_NAME}"
InstallDirRegKey HKCU "Software\CourseAhead\CCNALabs" "InstallDir"
RequestExecutionLevel user
SetCompressor /SOLID lzma
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

Function .onInit
  InitPluginsDir
  File /oname=$PLUGINSDIR\app-64.7z "${PAYLOAD}"
FunctionEnd

Section "Install" SEC01
  ; --- extract the app payload (electron-builder .nsis.7z of win-unpacked) ---
  CreateDirectory "$PLUGINSDIR\7z-out"
  SetOutPath "$PLUGINSDIR\7z-out"
  Nsis7z::Extract "$PLUGINSDIR\app-64.7z"
  IfErrors 0 +3
    MessageBox MB_OK|MB_ICONSTOP "Setup could not extract the application files. Please run Setup again."
    Abort
  SetOutPath "$INSTDIR"
  CopyFiles /SILENT "$PLUGINSDIR\7z-out\*.*" "$INSTDIR"

  ; --- shortcuts (desktop + Start Menu), icon = the app exe's stamped RHU icon ---
  CreateShortcut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE}" "" "$INSTDIR\${APP_EXE}" 0
  CreateDirectory "$SMPROGRAMS\${APP_NAME}"
  CreateShortcut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" "$INSTDIR\${APP_EXE}" "" "$INSTDIR\${APP_EXE}" 0
  CreateShortcut "$SMPROGRAMS\${APP_NAME}\Uninstall ${APP_NAME}.lnk" "$INSTDIR\${UNINST_EXE}" "" "$INSTDIR\${UNINST_EXE}" 0

  ; --- uninstaller, generated here on the user's machine ---
  WriteUninstaller "$INSTDIR\${UNINST_EXE}"

  ; --- Add/Remove Programs registration ---
  WriteRegStr HKCU "Software\CourseAhead\CCNALabs" "InstallDir" "$INSTDIR"
  WriteRegStr HKCU "${UNINST_KEY}" "DisplayName" "${APP_NAME}"
  WriteRegStr HKCU "${UNINST_KEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "${UNINST_KEY}" "Publisher" "${PUBLISHER}"
  WriteRegStr HKCU "${UNINST_KEY}" "DisplayIcon" "$INSTDIR\${APP_EXE}"
  WriteRegStr HKCU "${UNINST_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${UNINST_KEY}" "UninstallString" '"$INSTDIR\${UNINST_EXE}"'
  WriteRegStr HKCU "${UNINST_KEY}" "QuietUninstallString" '"$INSTDIR\${UNINST_EXE}" /S'
  WriteRegDWORD HKCU "${UNINST_KEY}" "NoModify" 1
  WriteRegDWORD HKCU "${UNINST_KEY}" "NoRepair" 1
  ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
  IntFmt $0 "0x%08X" $0
  WriteRegDWORD HKCU "${UNINST_KEY}" "EstimatedSize" "$0"
SectionEnd

Section "Uninstall"
  Delete "$DESKTOP\${APP_NAME}.lnk"
  Delete "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk"
  Delete "$SMPROGRAMS\${APP_NAME}\Uninstall ${APP_NAME}.lnk"
  RMDir "$SMPROGRAMS\${APP_NAME}"
  DeleteRegKey HKCU "${UNINST_KEY}"
  DeleteRegKey HKCU "Software\CourseAhead\CCNALabs"
  RMDir /r "$INSTDIR"
SectionEnd
