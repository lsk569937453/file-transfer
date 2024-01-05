import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"
import { invoke } from "@tauri-apps/api/tauri";
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation, Trans } from "react-i18next";
import { Separator } from "@/components/ui/separator"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import ReactECharts from 'echarts-for-react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core';
import {
    // LineChart,
    BarChart,
    // PieChart,
    // ScatterChart,
    // RadarChart,
    // MapChart,
    // TreeChart,
    // TreemapChart,
    // GraphChart,
    // GaugeChart,
    // FunnelChart,
    // ParallelChart,
    // SankeyChart,
    // BoxplotChart,
    // CandlestickChart,
    // EffectScatterChart,
    // LinesChart,
    // HeatmapChart,
    // PictorialBarChart,
    // ThemeRiverChart,
    // SunburstChart,
    // CustomChart,
} from 'echarts/charts';
// import components, all suffixed with Component
import {
    // GridSimpleComponent,
    GridComponent,
    // PolarComponent,
    // RadarComponent,
    // GeoComponent,
    // SingleAxisComponent,
    // ParallelComponent,
    // CalendarComponent,
    // GraphicComponent,
    // ToolboxComponent,
    TooltipComponent,
    // AxisPointerComponent,
    // BrushComponent,
    TitleComponent,
    // TimelineComponent,
    // MarkPointComponent,
    // MarkLineComponent,
    // MarkAreaComponent,
    // LegendComponent,
    // LegendScrollComponent,
    // LegendPlainComponent,
    // DataZoomComponent,
    // DataZoomInsideComponent,
    // DataZoomSliderComponent,
    // VisualMapComponent,
    // VisualMapContinuousComponent,
    // VisualMapPiecewiseComponent,
    // AriaComponent,
    // TransformComponent,
    DatasetComponent,
} from 'echarts/components';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
// Import renderer, note that introducing the CanvasRenderer or SVGRenderer is a required step
import {
    CanvasRenderer,
    // SVGRenderer,
} from 'echarts/renderers';
import { Divide } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area"

// Register the required components
echarts.use(
    [TitleComponent, TooltipComponent, GridComponent, BarChart, CanvasRenderer]
);
export function ActivityPage() {
    const { t, i18n } = useTranslation();

    const [currentInput, setCurrentInput] = useState();
    const { toast } = useToast()
    const [recentWeeksCommit, setRecentWeeksCommit] = useState();
    const[hoursOfDayCommit,setHoursOfDayCommit]=useState();
    const [dayOfWeekCommit,setDayOfWeekCommit]=useState();
    const [monthOfYearCommit,setMonthOfYearCommit]=useState();
    const [yearAndMonthCommit,setYearAndMonthCommit]=useState();
    const [yearCommit,setYearCommit]=useState();
    useEffect(() => {
        loadData();
    }, [])
    const loadData = async () => {

        const { response_code, response_msg } = JSON.parse(await invoke("get_commit_info"));
        console.log(response_code);
        console.log(response_msg);

        if (response_code === 0) {
            const { recent_weeks_commit, hours_of_day_commit, day_of_week, month_of_year_commit, year_and_month_commit
                , year_commit
            } = response_msg;
            let recentWeeksCommit=JSON.parse(recent_weeks_commit).commits_map;
            setRecentWeeksCommit(recentWeeksCommit);
            let hoursOfDayCommit=JSON.parse(hours_of_day_commit).commits_map;
            setHoursOfDayCommit(hoursOfDayCommit);

            let monthOfYearCommit=JSON.parse(month_of_year_commit).commits_map;
            setMonthOfYearCommit(monthOfYearCommit);

            let dayOfWeekCommit=JSON.parse(day_of_week).commits_map;
            setDayOfWeekCommit(dayOfWeekCommit);

            let yearAndMonthCommit=JSON.parse(year_and_month_commit).commits_map;
            setYearAndMonthCommit(yearAndMonthCommit);

            let yearCommit=JSON.parse(year_commit).commits_map;
            setYearCommit(yearCommit);
        }
    }
    const yearOp = () => {
        if (!yearCommit) {
            return {};
        }
        const xdata=[];
        const ydata=[];

        const ordered = Object.keys(yearCommit).sort().reduce(
            (obj:any, key:any) => { 
              obj[key] = yearCommit[key]; 
              return obj;
            }, 
            {}
          );

        for(var i in ordered){
            xdata.push(i);
            ydata.push(ordered[i]);
        }

        return {
            title: {
                text: '年统计',
            },
            xAxis: {
                type: 'category',
                data: xdata
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    data: ydata,
                    type: 'bar',
                    label: {
                        show: true,
                        position: 'top',
                      }
                }
            ]
        };
    };
    const yearAndMonthOp = () => {
        if (!yearAndMonthCommit) {
            return {};
        }
        const xdata=[];
        const ydata=[];

        const ordered = Object.keys(yearAndMonthCommit).sort().reduce(
            (obj:any, key:any) => { 
              obj[key] = yearAndMonthCommit[key]; 
              return obj;
            }, 
            {}
          );

        for(var i in ordered){
            xdata.push(i);
            ydata.push(ordered[i]);
        }

        return {
            title: {
                text: '年月统计',
            },
            xAxis: {
                type: 'category',
                data: xdata,
                axisLabel: {
                    interval: 0,
                    rotate: 60
                  },
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    data: ydata,
                    type: 'bar',
                    label: {
                        show: true,
                        position: 'top',
                      }
                }
            ]
        };
    };
    const monthOfYearOp = () => {
        if (!monthOfYearCommit) {
            return {};
        }
        const xdata=[];
        const ydata:any=[];

        for(var i = 1; i <=12; i++){
            xdata.push(i);

            ydata.push(monthOfYearCommit?.[i]);
        }
        return {
            title: {
                text: '月统计',
            },
            xAxis: {
                type: 'category',
                data: xdata
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    data: ydata,
                    type: 'bar',
                    label: {
                        show: true,
                        position: 'top',
                      }
                }
            ]
        };
    };
    const dayOfWeekOp = () => {
        if (!dayOfWeekCommit) {
            return {};
        }
        const xdata=["周一","周二","周三","周四","周五","周六","周日"];
        const ydata:any=[];

        for(var i = 1; i <=7; i++){
            ydata.push(dayOfWeekCommit?.[i]);
        }
        return {
            title: {
                text: '周统计',
            },
            xAxis: {
                type: 'category',
                data: xdata
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    data: ydata,
                    type: 'bar',
                    label: {
                        show: true,
                        position: 'top',
                      }
                }
            ]
        };
    };
    const hourOfDayOp = () => {
        if (!hoursOfDayCommit) {
            return {};
        }
        const xdata=[];
        const ydata:any=[];

        for(var i = 0; i <24; i++){
            xdata.push(i);
            ydata.push(hoursOfDayCommit?.[i]);
        }
        return {
            title: {
                text: '24小时commit统计',
            },
            xAxis: {
                type: 'category',
                data: xdata
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    data: ydata,
                    type: 'bar',
                    label: {
                        show: true,
                        position: 'top',
                      }
                }
            ]
        };
    };
   
    const recent32WeekOp = () => {
        if(!recentWeeksCommit){
            return {};
        }
        const xdata=[];
        const ydata:any=[];

        for(var i = 32; i >0; i--){
            xdata.push(i);
            ydata.push(recentWeeksCommit?.[i]);
        }
        return {
            title: {
                text: '最近32周活动',
            },
            xAxis: {
                type: 'category',
                data: xdata
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    data: ydata,
                    type: 'bar',
                    label: {
                        show: true,
                        position: 'top',
                      }
                }
            ]
        };
    };

    return (

        <Card className="px-10 h-full">
            <ScrollArea className="h-full">
                <div className="p-0 flex flex-col gap-5 text-right ">
                    <ReactEChartsCore
                        echarts={echarts}
                        notMerge={true}
                        lazyUpdate={true}
                        theme={"theme_name"}
                        option={recent32WeekOp()}
                    />
                    <Separator />
                    <ReactEChartsCore
                        echarts={echarts}
                        notMerge={true}
                        lazyUpdate={true}
                        theme={"theme_name"}
                        option={hourOfDayOp()}
                    />
                    <Separator />
                    <ReactEChartsCore
                        echarts={echarts}
                        notMerge={true}
                        lazyUpdate={true}
                        theme={"theme_name"}
                        option={dayOfWeekOp()}
                    />
                     <ReactEChartsCore
                        echarts={echarts}
                        notMerge={true}
                        lazyUpdate={true}
                        theme={"theme_name"}
                        option={monthOfYearOp()}
                    />
                     <ReactEChartsCore
                        echarts={echarts}
                        notMerge={true}
                        lazyUpdate={true}
                        theme={"theme_name"}
                        option={yearAndMonthOp()}
                    />
                    <ReactEChartsCore
                        echarts={echarts}
                        notMerge={true}
                        lazyUpdate={true}
                        theme={"theme_name"}
                        option={yearOp()}
                    />
                    <div className="flex flex-row">
                        <div className="basis-10/12">
                            <ReactEChartsCore
                                echarts={echarts}
                                notMerge={true}
                                lazyUpdate={true}
                                theme={"theme_name"}
                                option={dayOfWeekOp()}
                            />
                        </div>
                        <Table className="2/12">
                            <TableCaption>A list of your recent invoices.</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Status</TableHead>

                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>INV001</TableCell>
                                    <TableCell>Paid</TableCell>

                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                </div>
            </ScrollArea>
        </Card>

    );
}