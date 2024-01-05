

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { BaseInfoPage } from "./baseInfoPage";
import { Base64ImagePage } from './base64ImagePage';
import { useTranslation, Trans } from "react-i18next";
import { ActivityPage } from "./commitPage"

export default function Nav() {
  const { t, i18n } = useTranslation();

  return (<>
    <div className="sticky z-50 bg-gray-300 top-0 p-4">
      header contents
    </div>
    <div className="flex-grow">
      <main>
        <div>

        </div>
      </main>
    </div>
  </>
  );
}
