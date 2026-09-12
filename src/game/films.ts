export type Shot = {speaker:string;text:string;ref:string;seconds:number;view:"wide"|"god"|"accuser"|"job"|"friends"|"sky";action:"listen"|"speak"|"challenge"|"grieve"|"reach"|"walk";note?:string};
export type Film = {title:string;subtitle:string;chapter:number;summary:string;shots:Shot[]};
export const films:Film[]=[
{title:"하늘에서 시작된 질문",subtitle:"욥기 1:1–12 · 독자만 아는 장면",chapter:0,summary:"욥은 악행 때문에 벌을 받는 인물로 소개되지 않습니다. 독자는 하늘의 대화를 보지만 욥은 그 대화를 듣지 못합니다.",shots:[
{speaker:"해설",text:"욥은 우스 땅에 살던 사람입니다. 부유했고 가족이 많았으며, 하나님을 경외하고 악을 멀리했습니다.",ref:"1:1–5",seconds:11,view:"wide",action:"listen"},
{speaker:"해설",text:"이야기는 하늘의 모임으로 옮겨 갑니다. 하나님 앞에 사탄, 곧 욥의 진실함을 의심하는 고발자가 나타납니다.",ref:"1:6",seconds:11,view:"wide",action:"walk",note:"‘사탄’은 이 대목에서 고발자·대적자의 역할로 등장합니다. 인물의 외모는 본문에 없습니다."},
{speaker:"하나님",text:"너는 어디를 다녀왔느냐?",ref:"1:7",seconds:6,view:"god",action:"speak"},
{speaker:"사탄 · 고발자",text:"땅 곳곳을 돌아다니며 살펴보고 왔습니다.",ref:"1:7",seconds:7,view:"accuser",action:"speak"},
{speaker:"하나님",text:"내 종 욥을 보았느냐? 그는 바르게 살며 나를 경외하고 악을 멀리하는 사람이다.",ref:"1:8",seconds:10,view:"god",action:"reach"},
{speaker:"사탄 · 고발자",text:"욥이 아무 이익도 없이 하나님을 경외하겠습니까? 보호와 복을 거두면, 그가 하나님을 저주할 것입니다.",ref:"1:9–11",seconds:12,view:"accuser",action:"challenge"},
{speaker:"하나님",text:"그의 소유는 네 손에 맡기겠다. 그러나 욥의 몸에는 손대지 마라.",ref:"1:12",seconds:9,view:"god",action:"speak"},
{speaker:"해설",text:"욥은 이 대화를 모릅니다. 이제 독자는 그가 알지 못하는 질문을 품은 채, 땅에서 벌어지는 일을 보게 됩니다.",ref:"1:6–22",seconds:11,view:"wide",action:"listen",note:"이 장면을 모든 사람의 고통에 적용되는 원인 공식으로 제시하지 않습니다."}
]},
{title:"무너진 하루, 두 번째 대화",subtitle:"욥기 1:13–3:26 · 상실과 탄식",chapter:1,summary:"재산과 자녀를 잃은 뒤 욥은 몸의 고통까지 겪습니다. 아내도 같은 상실을 겪었고, 욥은 마침내 자신의 태어난 날을 탄식합니다.",shots:[
{speaker:"해설",text:"전령들이 연이어 찾아옵니다. 습격과 재난으로 가축과 종들을 잃고, 큰 바람에 집이 무너져 자녀들까지 죽었다는 소식입니다.",ref:"1:13–19",seconds:13,view:"wide",action:"walk"},
{speaker:"욥",text:"빈손으로 태어났으니 빈손으로 돌아갈 것입니다. 주신 분도, 거두신 분도 하나님이십니다.",ref:"1:20–22",seconds:11,view:"job",action:"grieve"},
{speaker:"해설",text:"하늘에서 두 번째 대화가 열립니다. 하나님은 욥이 까닭 없이 무너졌어도 여전히 진실함을 지켰다고 말합니다.",ref:"2:1–3",seconds:12,view:"sky",action:"listen"},
{speaker:"사탄 · 고발자",text:"그의 몸을 쳐 보십시오. 그러면 하나님을 저주할 것입니다.",ref:"2:4–5",seconds:9,view:"accuser",action:"challenge"},
{speaker:"하나님",text:"그를 네 손에 맡긴다. 다만 그의 생명은 보존하여라.",ref:"2:6",seconds:8,view:"god",action:"speak"},
{speaker:"해설",text:"온몸에 종기가 난 욥은 재 가운데 앉습니다. 아내는 하나님을 저주하고 죽으라고 말하지만, 욥은 그 말을 받아들이지 않습니다.",ref:"2:7–10",seconds:13,view:"job",action:"grieve",note:"아내의 말도 자녀를 잃은 사람의 절망 속에서 읽어 봅니다. 이는 이 작품의 해석입니다."},
{speaker:"욥",text:"차라리 내가 태어난 날이 없었더라면. 왜 고통받는 사람에게 생명이 주어지는가?",ref:"3:1–26",seconds:11,view:"job",action:"reach",note:"욥은 자신의 태어난 날을 저주합니다. 탄식의 대상을 하나님에 대한 저주로 바꾸지 않았습니다."}
]},
{title:"곁에 앉았던 친구들",subtitle:"욥기 2:11–13; 4–27장 · 위로에서 논쟁으로",chapter:2,summary:"엘리바스, 빌닷, 소발은 처음에는 침묵으로 함께합니다. 그러나 고통의 원인을 죄로 설명하려 하면서 욥과 부딪힙니다.",shots:[
{speaker:"해설",text:"세 친구 엘리바스, 빌닷, 소발이 찾아옵니다. 알아보기 힘들 만큼 변한 욥을 보고 울며, 일곱 날 밤낮 말없이 곁에 앉습니다.",ref:"2:11–13",seconds:13,view:"wide",action:"listen"},
{speaker:"엘리바스",text:"죄 없이 망한 사람이 있었던가? 내가 보기에 악을 심은 사람은 그 열매를 거두네.",ref:"4:7–8",seconds:10,view:"friends",action:"speak"},
{speaker:"빌닷",text:"하나님이 정의를 굽히시겠는가? 자네가 깨끗하고 정직하다면 다시 돌보아 주실 걸세.",ref:"8:3–7",seconds:11,view:"friends",action:"challenge"},
{speaker:"소발",text:"잘못을 멀리하고 하나님께 마음을 바로 세우게. 그러면 두려움 없이 살 수 있을 걸세.",ref:"11:13–19",seconds:11,view:"friends",action:"reach"},
{speaker:"욥",text:"자네들은 나를 위로한다고 하지만 오히려 괴롭히는군. 내가 자네들 처지라면 말로 힘을 북돋아 주겠네.",ref:"16:2–5",seconds:12,view:"job",action:"speak"},
{speaker:"해설",text:"친구들의 설명은 점점 비난이 됩니다. 하지만 독자는 처음부터 욥이 바른 사람으로 소개되었다는 사실을 알고 있습니다.",ref:"1:1; 4–27",seconds:12,view:"wide",action:"listen",note:"친구의 주장을 성경 전체의 결론처럼 받아들이지 않도록 화자를 표시합니다."}
]},
{title:"욥은 답을 요구한다",subtitle:"욥기 23–37장 · 항변, 지혜, 엘리후",chapter:3,summary:"욥은 하나님을 만나 자신의 사정을 말하고 싶어 합니다. 지혜의 시와 엘리후의 말이 이어지지만 논쟁만으로 답은 나지 않습니다.",shots:[
{speaker:"욥",text:"하나님이 계신 곳을 안다면 찾아가 내 사정을 아뢰고 싶네. 어떤 대답을 하실지 듣고 싶네.",ref:"23:3–7",seconds:11,view:"job",action:"reach"},
{speaker:"해설",text:"욥은 자신의 과거를 돌아보며 약한 사람을 도왔다고 말합니다. 숨은 죄를 인정하라는 친구들의 요구를 그대로 받아들이지 않습니다.",ref:"29–31",seconds:13,view:"wide",action:"listen"},
{speaker:"해설",text:"책 가운데에는 지혜를 찾는 시가 있습니다. 사람은 땅속 보물도 캐내지만, 지혜를 어디에서 얻을 수 있을까요?",ref:"28:1–28",seconds:12,view:"sky",action:"listen"},
{speaker:"엘리후",text:"고통은 사람에게 경고하고 귀를 열게 하는 일이 될 수도 있습니다.",ref:"33:14–30; 36:15",seconds:9,view:"friends",action:"speak",note:"엘리후의 주장은 등장인물의 설명입니다. 모든 고통의 이유로 확정하지 않습니다."},
{speaker:"해설",text:"젊은 엘리후까지 긴 말을 보탭니다. 이제 인간의 설명이 멈추고, 폭풍 속에서 다른 목소리가 들려옵니다.",ref:"32–37; 38:1",seconds:11,view:"sky",action:"listen"}
]},
{title:"폭풍 속에서 들려온 목소리",subtitle:"욥기 38–41장 · 창조 세계를 바라보다",chapter:4,summary:"하나님은 폭풍 가운데 응답합니다. 욥에게 고난의 비밀을 알려주는 대신, 인간의 시야를 넘어서는 세계를 질문으로 펼쳐 보입니다.",shots:[
{speaker:"해설",text:"마침내 하나님이 폭풍 가운데서 욥에게 말씀합니다. 그러나 하늘에서 있었던 사탄과의 대화를 설명해 주지는 않습니다.",ref:"38:1–3",seconds:12,view:"wide",action:"listen"},
{speaker:"하나님",text:"내가 땅의 기초를 놓을 때 너는 어디에 있었느냐? 그 크기를 정한 이가 누구인지 아느냐?",ref:"38:4–7",seconds:11,view:"sky",action:"speak"},
{speaker:"하나님",text:"너는 바다의 문을 닫고, 아침에게 오라고 명령해 보았느냐?",ref:"38:8–15",seconds:9,view:"wide",action:"speak"},
{speaker:"해설",text:"비와 별, 야생 동물과 새들의 삶이 펼쳐집니다. 이 세계는 인간의 필요와 판단만으로 움직이지 않습니다.",ref:"38:25–39:30",seconds:11,view:"sky",action:"listen"},
{speaker:"하나님",text:"베헤못을 보아라. 너와 같이 내가 지은 것이다. 너는 리워야단을 낚아 길들일 수 있겠느냐?",ref:"40:15–41:34",seconds:12,view:"wide",action:"reach",note:"두 생명의 구체적인 정체에는 여러 해석이 있습니다. 화면은 문학적 상상입니다."},
{speaker:"욥",text:"나는 무슨 말을 더 하겠습니까? 내 입을 손으로 가리겠습니다.",ref:"40:3–5",seconds:8,view:"job",action:"grieve"}
]},
{title:"응답 뒤에 남은 삶",subtitle:"욥기 42장 · 친구들의 책망과 다시 살아감",chapter:5,summary:"하나님은 친구들을 책망하고 욥은 그들을 위해 기도합니다. 삶은 다시 이어지지만, 잃은 사람들의 자리가 지워지는 결말로 읽지는 않습니다.",shots:[
{speaker:"욥",text:"이제야 알겠습니다. 내가 이해하지 못하는 일을 말했습니다. 귀로만 듣던 주님을 이제 뵙습니다.",ref:"42:1–6",seconds:11,view:"job",action:"reach",note:"42:6의 ‘회개·거둠·위로’와 관련한 번역 및 해석은 다양합니다. 고난의 원인이 욥의 죄였다고 결론 내리지 않습니다."},
{speaker:"하나님",text:"너희는 내 종 욥처럼 나에 대해 바르게 말하지 않았다. 욥이 너희를 위해 기도하게 하여라.",ref:"42:7–9",seconds:11,view:"sky",action:"speak"},
{speaker:"해설",text:"친구들은 지시를 따르고 욥은 그들을 위해 기도합니다. 가족과 지인들도 찾아와 그가 겪은 일을 함께 슬퍼하며 위로합니다.",ref:"42:9–11",seconds:12,view:"wide",action:"listen"},
{speaker:"해설",text:"이야기는 재산이 회복되고 다시 자녀를 얻으며, 욥이 오래 살아 후손을 보았다고 전합니다.",ref:"42:10–17",seconds:10,view:"wide",action:"listen"},
{speaker:"해설",text:"회복을 잃은 자녀들의 대체로 여기지는 않으려 합니다. 모든 고통의 이유를 안다고 말하기보다, 고통받는 사람 곁에 어떻게 설지 묻습니다.",ref:"42장 · 작품의 성찰",seconds:14,view:"job",action:"listen",note:"마지막 문장은 성경의 직접 인용이 아니라 이 작품이 제안하는 성찰입니다."}
]}
];
export const duration=(film:Film)=>film.shots.reduce((s,x)=>s+x.seconds,0);
export function locate(film:Film,time:number){let start=0;for(let i=0;i<film.shots.length;i++){if(time<start+film.shots[i].seconds||i===film.shots.length-1)return {index:i,start,progress:Math.min(1,Math.max(0,(time-start)/film.shots[i].seconds))};start+=film.shots[i].seconds;}return {index:0,start:0,progress:0};}
