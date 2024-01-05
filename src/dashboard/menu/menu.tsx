"use client"

import { useCallback, useEffect, useState } from "react"
import logo from "@/assets/logo.png"
import { Globe, Mic, Sailboat } from "lucide-react"
// import { WindowTitlebar } from "tauri-controls"

import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { open } from '@tauri-apps/api/dialog';

import { AboutDialog } from "./about-dialog"
import { PreferenceDialog } from "./preferenceDialog"
import { MenuModeToggle } from "./themModeMenu"
import { LanguageMenu } from "./languageMenu"
import { Dialog, DialogTrigger } from "../../components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useTranslation, Trans } from "react-i18next";
import { CreateLinkDialog } from "./createLinkDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { invoke } from "@tauri-apps/api/tauri";

import { LoadingSpinner } from "../components/spinner";
import { useToast } from "@/components/ui/use-toast"

export function Menu() {

  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [showPreferenceDialog, setShowPreferenceDialog] = useState(false);
  const [showCreateLinkDialog, setShowCreateLinkDialog] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const { toast } = useToast()

  const buttonClick = async () => {
    const selected = await open({
      directory: true,
      multiple: false,

    });
    if (Array.isArray(selected)) {
      return;

    } else if (selected === null) {
      return;
    } else {
    };
    setShowLoading(true);
    const { response_code, response_msg } = JSON.parse(await invoke("init_git", { repoPath: selected }));
    console.log(response_code);
    console.log(response_msg);
    if (response_code == 0) {
      window.location.reload();// 强制页面刷新

    } else {
      toast({
        variant: "destructive",
        title: t('toastMessage.errorMessageTile'),
        description: t('base64ImagePage.base64ShouldNotEmptyMessageBody'),
      })
    }
    console.log(selected);
    setShowLoading(false);

  };
  const saveHtml = () => {
    var pageHTML = document.documentElement.outerHTML;

    var tempEl = document.createElement('a');

    tempEl.href = 'data:attachment/text,' + encodeURI(pageHTML);
    tempEl.target = '_blank';
    tempEl.download = 'thispage.html';
    tempEl.click();
  }
  return (
    <div>
      <AlertDialog open={showLoading} onOpenChange={setShowLoading}>
        <AlertDialogContent className="w-30 ">
          <LoadingSpinner size={48} color="indigo" />
        </AlertDialogContent>
      </AlertDialog>
      <Menubar className="rounded-none border-b border-none pl-2 lg:pl-3">
        <MenubarMenu>

        </MenubarMenu>
        <Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}>
          <AboutDialog />
        </Dialog>

        <Dialog open={showPreferenceDialog} onOpenChange={setShowPreferenceDialog}>
          <PreferenceDialog />
        </Dialog>
        <Dialog open={showCreateLinkDialog} onOpenChange={setShowCreateLinkDialog} >
          <CreateLinkDialog />
        </Dialog>
        <MenubarMenu>
          <MenubarTrigger className="font-bold">{t('toolBar.app.name')}</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => setShowAboutDialog(true)}>{t('toolBar.app.first_item')}</MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => setShowPreferenceDialog(true)}>
              {t('toolBar.app.second_item')}
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className="font-bold">配置</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => buttonClick()}>选择git仓库地址</MenubarItem>
            {/* <MenubarSeparator />
            <MenubarItem onClick={() => saveHtml()}>
              保存html
            </MenubarItem> */}
          </MenubarContent>
        </MenubarMenu>
        {/* <MenuModeToggle /> */}
        <LanguageMenu />
      </Menubar>
    </div>
  )
}
