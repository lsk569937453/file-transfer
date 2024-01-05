import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {BaseInfoPage}from "./baseInfoPage";
import { Base64ImagePage } from './base64ImagePage';
import { useTranslation, Trans } from "react-i18next";
import {ActivityPage }from "./commitPage"
import { AuthorPage } from "./authorPage";
export default function Base64Page() {
  const { t, i18n } = useTranslation();

    return (
      <Tabs defaultValue="text" className="w-full  h-[calc(100vh-60px)] p-10 flex flex-col	" >
      <TabsList className="grid w-1/2 grid-cols-4 flex-initial" >
        <TabsTrigger value="text">{t('convertToolsPage.base64TextTabName')}</TabsTrigger>
        <TabsTrigger value="image">{t('convertToolsPage.base64ImageTabName')}</TabsTrigger>
        <TabsTrigger value="halftofull">{t('convertToolsPage.halfFullTabName')}</TabsTrigger>
        <TabsTrigger value="regex">{t('convertToolsPage.regexName')}</TabsTrigger>
      </TabsList>
      <TabsContent value="text"  className="w-full h-full"><BaseInfoPage/></TabsContent>
      <TabsContent value="image"  className="w-full h-full"><ActivityPage/></TabsContent>
      <TabsContent value="halftofull"  className="w-full h-full"><AuthorPage/></TabsContent>
      <TabsContent value="regex"  className="w-full h-full"><BaseInfoPage/></TabsContent>

    </Tabs>
    );
}