import { cn } from "@/lib/utils"

export interface ISVGProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
    className?: string;
}

export const LoadingSpinner = ({ size = 24,color="red", className, ...props }: ISVGProps) => {
    return (
        // <svg
        //     xmlns="http://www.w3.org/2000/svg"
        //     width={size}
        //     height={size}
        //     {...props}
        //     viewBox="0 0 24 24"
        //     fill="none"
        //     stroke="currentColor"
        //     strokeWidth="2"
        //     strokeLinecap="round"
        //     strokeLinejoin="round"
        //     className={cn("animate-spin", className)}
        // >
        //     <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        // </svg>
        <svg xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none" stroke={color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={cn("animate-spin", className)}
        >
            <line x1="12" y1="2" x2="12" y2="6">
            </line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93">

            </line>
        </svg>
    );
}
