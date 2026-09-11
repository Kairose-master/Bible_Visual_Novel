import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import appCss from "../styles.css?url";
import meta from "../app-meta.json";
declare const __HF_DESIGN_INSPECTOR__: boolean;
const origin="https://job-unanswered-court.higgsfield.app";
export const Route = createRootRouteWithContext<{queryClient:QueryClient}>()({
 head:()=>({meta:[{charSet:"utf-8"},{name:"viewport",content:"width=device-width, initial-scale=1"},{title:meta.og_title},{name:"description",content:meta.og_description},{name:"theme-color",content:"#080f18"},{property:"og:title",content:meta.og_title},{property:"og:description",content:meta.og_description},{property:"og:type",content:"website"},{property:"og:locale",content:"ko_KR"},{property:"og:url",content:origin},{property:"og:image",content:origin+meta.og_image_url},{name:"twitter:card",content:"summary_large_image"},{name:"twitter:image",content:origin+meta.og_image_url}],links:[{rel:"stylesheet",href:appCss},{rel:"icon",href:meta.favicon_url},{rel:"canonical",href:origin}]}),
 shellComponent:({children}:{children:ReactNode})=><html lang="ko"><head><HeadContent/></head><body>{children}<Scripts/></body></html>,
 component:Root,
 notFoundComponent:()=> <main className="ending-body"><h1>길을 찾지 못했습니다.</h1><Link to="/">이야기의 처음으로</Link></main>,
 errorComponent:()=> <main className="ending-body"><h1>잠시 페이지를 열지 못했습니다.</h1><p>새로고침하면 처음부터 다시 읽을 수 있습니다.</p><a href="/">다시 열기</a></main>
});
function Root(){const {queryClient}=Route.useRouteContext();useEffect(()=>{if(!__HF_DESIGN_INSPECTOR__)return;void import("../module/design-inspector/runtime").then(({installHiggsfieldDesignInspector})=>installHiggsfieldDesignInspector()).catch(()=>{});},[]);return <QueryClientProvider client={queryClient}><Outlet/></QueryClientProvider>;}
