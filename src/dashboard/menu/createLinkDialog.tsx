import { useEffect, useState } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { UpdateIcon } from "@radix-ui/react-icons"
import { invoke } from "@tauri-apps/api/tauri";
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Icons } from "./icons"
import { Button, buttonVariants } from "../../components/ui/button"
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog"
import { useTranslation, Trans } from "react-i18next";

import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
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
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "../components/spinner"
const delay = (ms: number) => new Promise(
    resolve => setTimeout(resolve, ms)
);

const formatMap = new Map([
    ["mysql", 0],
    ["sqlite", 1],
    ["postgresql", 2]
])

export function CreateLinkDialog() {
    const { toast } = useToast()
    const { t, i18n } = useTranslation();
    const [currentLinkType, setCurrentLinkType] = useState<any>("mysql");
    const [currentUrl, setCurrentUrl] = useState<any>("");
    const [currentHost, setCurrentHost] = useState<any>("");
    const [currentPort, setCurrentPort] = useState<any>("");
    const [currentDatabase, setCurrentDatabase] = useState<any>("");
    const [currentUsername, setCurrentUsername] = useState<any>("");
    const [currentPassword, setCurrentPassword] = useState<any>("");
    const [connectType, setConnectType] = useState<any>("connectTypeHost");
    const [showLoading, setShowLoading] = useState(false);
    const handleTestLinkButtonClick = async () => {
        const testHostStruct = {
            TestHost: {
                host: currentHost,
                port: parseInt(currentPort),
                database: currentDatabase,
                user_name: currentUsername,
                password: currentPassword,
            }
        };
        const testUrl = {
            TestUrl: currentUrl
        };
        const testDatabaseRequest = {
            database_type: formatMap.get(currentLinkType),
            source: connectType === "connectTypeHost" ? testHostStruct : testUrl,

        };
        console.log("req:" + JSON.stringify(testDatabaseRequest));

        setShowLoading(true);
        const { response_code, response_msg } = JSON.parse(await invoke("test_url", { testDatabaseRequest: testDatabaseRequest }).then((res:any) => {
            setShowLoading(false);

            return res;
        }).catch((e:any) => {
            setShowLoading(false);
            console.error(e);
            return e;
        }));
        setShowLoading(false);

        console.log(response_code);
        console.log(response_msg);
        if (response_code === 0) {
            toast({
                title: "操作信息",
                description: "菜单项已经重置成功。",
            });
        } else {
            toast({
                variant: "destructive",
                title: "操作信息",
                description: response_msg,
            })
        }

    }
    return (
        <>

            <DialogContent className="overflow-clip max-w-4xl">
                <DialogHeader className="flex items-center text-center">
                    <DialogTitle className="flex flex-col items-center">
                        配置连接
                    </DialogTitle>
                    <Separator />
                </DialogHeader>
                <div className="flex flex-col gap-5">
                    <div className="flex flex-row items-center gap-5">
                        <p className="basis-2/12 text-right">连接类型:</p>
                        <Select defaultValue={"mysql"} onValueChange={(e) => setCurrentLinkType(e)}>
                            <SelectTrigger className="basis-10/12">
                                <SelectValue />

                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mysql">Mysql</SelectItem>
                                <SelectItem value="sqlite">Sqlite</SelectItem>

                                <SelectItem value="postgresql">PostGresql</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-row items-center gap-5">
                        <AlertDialog open={showLoading} onOpenChange={setShowLoading}>
                            <AlertDialogContent className="w-30 ">
                                <LoadingSpinner size={48} color="indigo"/>
                            </AlertDialogContent>
                        </AlertDialog>
                        <p className="basis-2/12 text-right">连接方式:</p>
                        <RadioGroup defaultValue="connectTypeHost" orientation="horizontal" className="grid-flow-col" onValueChange={(e) => setConnectType(e)}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="connectTypeHost" id="option-two" />
                                <Label htmlFor="connectTypeHost">主机</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="connectTypeUrl" id="option-one" />
                                <Label htmlFor="connectTypeUrl">连接串</Label>
                            </div>

                        </RadioGroup>
                    </div>
                    {connectType === "connectTypeUrl" && <div className="flex flex-row items-center gap-5">
                        <p className="basis-2/12 text-right">连接串:</p>
                        <Input className="basis-10/12" placeholder="请输入连接串。" onChange={(e) => setCurrentUrl(e.target.value)} value={currentUrl}></Input>
                    </div>
                    }
                    {connectType === "connectTypeHost" &&
                        <><div className="flex flex-row items-center gap-5">
                            <p className="basis-2/12 text-right">服务器地址:</p>
                            <Input className="basis-6/12" placeholder="主机地址" onChange={(e) => setCurrentHost(e.target.value)} value={currentHost}></Input>
                            <p className="basis-1/12 text-right">端口:</p>
                            <Input className="basis-1/12" placeholder="端口" onChange={(e) => setCurrentPort(e.target.value)} value={currentPort}></Input>
                        </div>
                            <div className="flex flex-row items-center gap-5">
                                <p className="basis-2/12 text-right">数据库:</p>
                                <Input className="basis-10/12" placeholder="数据库名" onChange={(e) => setCurrentDatabase(e.target.value)} value={currentDatabase}></Input>

                            </div>
                        </>
                    }
                    <div className="flex flex-row items-center gap-5">
                        <p className="basis-2/12 text-right">用户名:</p>
                        <Input className="basis-10/12" placeholder="用户名" onChange={(e) => setCurrentUsername(e.target.value)} value={currentUsername}></Input>
                    </div>
                    <div className="flex flex-row items-center gap-5">
                        <p className="basis-2/12 text-right">密码:</p>
                        <Input className="basis-10/12" placeholder="密码" onChange={(e) => setCurrentPassword(e.target.value)} value={currentPassword}></Input>
                    </div>
                    <div className="flex flex-row items-center gap-5">
                        <Button className="basis-6/12">创建连接</Button>
                        <Button className="basis-6/12" variant="outline" onClick={handleTestLinkButtonClick}>测试连接</Button>
                    </div>

                </div>

            </DialogContent>
        </>
    )
}
