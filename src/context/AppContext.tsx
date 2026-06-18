"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  bio: string;
  role: "reader" | "creator" | "admin";
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
}

export interface Post {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_avatar: string;
  title: string;
  content: string;
  preview_content: string;
  is_premium: boolean;
  category: string;
  status: "draft" | "published";
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  creator_id: string;
  status: "active" | "canceled" | "expired";
  current_period_end: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  status: "paid" | "failed";
  pg_tid: string;
  created_at: string;
  creator_name: string;
}

export interface Payout {
  id: string;
  creator_id: string;
  creator_name: string;
  amount: number;
  status: "pending" | "paid";
  bank_name: string;
  account_number: string;
  account_holder: string;
  created_at: string;
  paid_at?: string;
}

interface AppContextType {
  currentUser: Profile;
  posts: Post[];
  subscriptions: Subscription[];
  payments: Payment[];
  payouts: Payout[];
  setCurrentUser: (profile: Profile) => void;
  toggleRole: () => void;
  publishPost: (title: string, category: string, isPremium: boolean, previewContent: string, fullContent: string) => void;
  subscribeToCreator: (creatorId: string, creatorName: string, amount: number) => Promise<boolean>;
  cancelSubscription: (creatorId: string) => void;
  updatePayoutAccount: (bankName: string, accountNumber: string, accountHolder: string) => void;
  executePayout: (payoutId: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Mock Creators, Reader & Admin
const INITIAL_PROFILES: { [key: string]: Profile } = {
  reader: {
    id: "reader-user-id",
    username: "김성장 (직장인 독자)",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "성장하고 싶은 3년차 주니어 마케터입니다. 트렌드와 생산성 도구에 관심이 많습니다.",
    role: "reader"
  },
  creator: {
    id: "creator-user-id",
    username: "이동욱 (시니어 엔지니어)",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bio: "글로벌 IT 기업에서 일하고 있는 백엔드 엔지니어입니다. 아키텍처와 경력 성장에 대해 씁니다.",
    role: "creator",
    bank_name: "신한은행",
    account_number: "110-384-293847",
    account_holder: "이동욱"
  },
  admin: {
    id: "admin-user-id",
    username: "김관리 (InsightBridge 팀장)",
    avatar_url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
    bio: "InsightBridge 플랫폼 재무 및 정산 총괄 관리자 계정입니다.",
    role: "admin"
  }
};

const MOCK_CREATORS = {
  debbie: {
    id: "creator-debbie",
    name: "데비 (UI/UX 디렉터)",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    bank_name: "국민은행",
    account_number: "3928-102-192039",
    account_holder: "데비"
  },
  techbuilder: {
    id: "creator-user-id",
    name: "이동욱 (시니어 엔지니어)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    bank_name: "신한은행",
    account_number: "110-384-293847",
    account_holder: "이동욱"
  },
  copymaster: {
    id: "creator-copymaster",
    name: "카피마스터 (성장 마케터)",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    bank_name: "우리은행",
    account_number: "1002-392-102930",
    account_holder: "카피마스터"
  },
  scaleup: {
    id: "creator-scaleup",
    name: "스케일업 (VC 파트너)",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    bank_name: "하나은행",
    account_number: "392-102938-19302",
    account_holder: "스케일업"
  }
};

const INITIAL_POSTS: Post[] = [
  {
    id: "post-1",
    creator_id: MOCK_CREATORS.debbie.id,
    creator_name: MOCK_CREATORS.debbie.name,
    creator_avatar: MOCK_CREATORS.debbie.avatar,
    title: "AI가 디자이너의 일자리를 위협할까? 2026 실무 생존 가이드",
    category: "디자인",
    is_premium: true,
    status: "published",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    preview_content: "인공지능(AI) 디자인 생성 모델들이 비약적으로 발전하면서 수많은 주니어 디자이너와 실무진들이 불안감에 휩싸여 있습니다. 피그마(Figma)에 도입된 AI 플러그인부터 미드저니, 스테이블 디퓨전의 정밀한 UI 생성 능력까지... 단순 화면 배치만을 하던 UI 디자이너의 가치는 급락하고 있습니다.\n\n하지만 이것이 디자이너라는 직군 자체의 멸망을 뜻하는 것은 아닙니다. 오히려 '문제 정의'와 '맥락 설계'라는 디자이너 고유의 가치가 더욱 부각되는 시기입니다. 본 아티클에서는 AI 시대에 살아남고 몸값을 올릴 수 있는 세 가지 구체적인 실무 대응 전략을 다룹니다.",
    content: "인공지능(AI) 디자인 생성 모델들이 비약적으로 발전하면서 수많은 주니어 디자이너와 실무진들이 불안감에 휩싸여 있습니다. 피그마(Figma)에 도입된 AI 플러그인부터 미드저니, 스테이블 디퓨전의 정밀한 UI 생성 능력까지... 단순 화면 배치만을 하던 UI 디자이너의 가치는 급락하고 있습니다.\n\n하지만 이것이 디자이너라는 직군 자체의 멸망을 뜻하는 것은 아닙니다. 오히려 '문제 정의'와 '맥락 설계'라는 디자이너 고유의 가치가 더욱 부각되는 시기입니다. 본 아티클에서는 AI 시대에 살아남고 몸값을 올릴 수 있는 세 가지 구체적인 실무 대응 전략을 다룹니다.\n\n### 1. 와이어프레임 생성기를 내 부사수로 다루는 방법\n더 이상 하얀 캔버스에서 시작해 픽셀을 정렬하는 데 시간을 허비하지 마십시오. 프롬프트를 통해 10초 만에 5개의 로그인 화면 시안을 받아본 후, 거기서 발생할 수 있는 엣지 케이스(Edge Cases)와 사용자 예외 흐름을 보완하는 데 집중해야 합니다. 디자인의 '생산'은 기계가 하지만, '의사결정'과 '검증'은 오롯이 디자이너의 몫입니다.\n\n### 2. 비즈니스 지표(Business Metric) 중심의 디자인 논리 구축\n사용성 점수를 올리는 데 그치지 않고, 디자인 수정이 결제 전환율(Conversion)이나 리텐션(Retention)에 어떤 기여를 했는지 수치로 설득할 수 있어야 합니다. 디자인을 비즈니스 언어로 번역하는 역량이 AI 디자인 툴과 당신을 구분 짓는 가장 큰 벽이 될 것입니다.\n\n### 3. 인터랙션과 프로토타입의 정교함 극대화\n정적 화면 생성은 AI가 잘하지만, 각 컴포넌트 간의 매끄러운 트랜지션과 마이크로인터랙션은 사용자의 무의식적인 만족감을 결정합니다. 피그마의 고급 프로토타이핑 기능이나 스마트 애니메이션의 역량을 높이십시오. 손끝에서 느껴지는 고급스러운 반응 속도가 제품의 등급을 다르게 만듭니다."
  },
  {
    id: "post-2",
    creator_id: MOCK_CREATORS.techbuilder.id,
    creator_name: MOCK_CREATORS.techbuilder.name,
    creator_avatar: MOCK_CREATORS.techbuilder.avatar,
    title: "Next.js 16 App Router와 React Server Component의 깊은 함정들",
    category: "개발",
    is_premium: false,
    status: "published",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    preview_content: "Next.js App Router가 성숙 단계에 접어들며 많은 팀들이 Pages Router에서 마이그레이션을 진행하고 있습니다. 그러나 단순 프레임워크 업그레이드 정도로 생각하고 접근했다가, Server-Side Data Fetching과 Client Component 간의 데이터 통신, 무한 렌더링 룹, 배포 환경에서의 캐시 오염 등으로 고통받는 팀들이 속출하고 있습니다.\n\n이 글에서는 React Server Component(RSC) 모델의 실제 렌더링 생명주기를 살펴보고, 많은 엔지니어들이 범하는 대표적인 설계 실수와 이를 해결하는 정형화된 패턴을 공유합니다. 누구나 볼 수 있는 무료 아티클로, 기본 설계 패러다임 변화를 이해하는 데 큰 도움이 될 것입니다.",
    content: "Next.js App Router가 성숙 단계에 접어들며 많은 팀들이 Pages Router에서 마이그레이션을 진행하고 있습니다. 그러나 단순 프레임워크 업그레이드 정도로 생각하고 접근했다가, Server-Side Data Fetching과 Client Component 간의 데이터 통신, 무한 렌더링 룹, 배포 환경에서의 캐시 오염 등으로 고통받는 팀들이 속출하고 있습니다.\n\n이 글에서는 React Server Component(RSC) 모델의 실제 렌더링 생명주기를 살펴보고, 많은 엔지니어들이 범하는 대표적인 설계 실수와 이를 해결하는 정형화된 패턴을 공유합니다. 누구나 볼 수 있는 무료 아티클로, 기본 설계 패러다임 변화를 이해하는 데 큰 도움이 될 것입니다.\n\n### 1. RSC는 브라우저에서 실행되지 않는다\n많은 분들이 실수하는 것 중 하나가 서버 컴포넌트 내에 `window` 객체나 `localStorage`에 접근하는 코드를 작성하고 배포 타임 에러를 겪는 것입니다. RSC는 빌드 타임 혹은 서버 런타임에 직렬화된 JSON 구조(RSC Payload)로 변경되며 브라우저로 전송됩니다. 상호작용이 필요 없는 정적 레이아웃이나 데이터 조회 로직은 RSC에 두되, 이벤트 리스너와 로컬 상태가 필요한 모든 컴포넌트는 최상단에 `'use client'` 지시어를 선언해야 합니다.\n\n### 2. 지나치게 촘촘한 'use client' 분리하기\n파일 전체를 `'use client'`로 덮어쓰는 것은 기존 Pages Router 방식과 다르지 않으며 RSC의 번들 사이즈 감소 이점을 누릴 수 없습니다. 최선의 실무 방식은 최하위 잎새(Leaf) 노드만 클라이언트 컴포넌트로 만드는 것입니다. 예를 들어 리스트 전체는 서버 컴포넌트(RSC)로 그리되, 좋아요 버튼이나 검색 입력바만 독립적인 클라이언트 컴포넌트로 떼어내 자식(Children) 혹은 Props로 주입하는 구조를 지향해야 합니다."
  },
  {
    id: "post-3",
    creator_id: MOCK_CREATORS.copymaster.id,
    creator_name: MOCK_CREATORS.copymaster.name,
    creator_avatar: MOCK_CREATORS.copymaster.avatar,
    title: "토스(Toss)가 가입률을 300% 올린 마이크로 카피 분석",
    category: "마케팅",
    is_premium: true,
    status: "published",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    preview_content: "우리가 매일 사용하는 금융 서비스 토스. 토스는 어려운 금융 약어를 없애고 '친구에게 송금하듯' 친근한 텍스트로 사용자의 지갑을 엽니다. 같은 기능이라도 어떻게 카피를 쓰느냐에 따라 사용자 클릭율(CTR)은 최소 20%에서 최대 300%까지 차이를 보입니다.\n\n대다수 커머스나 테크 제품들이 공급자 중심의 차가운 텍스트를 고집할 때, 토스가 보여준 '사용자 중심 카피 라이팅' 원칙을 A/B 테스트 지표와 함께 낱낱이 파헤쳐 봅니다. 여러분의 웹서비스 문구 하나만 바꾸어도 매출이 즉시 오를 수 있는 실전 팁을 제공합니다.",
    content: "우리가 매일 사용하는 금융 서비스 토스. 토스는 어려운 금융 약어를 없애고 '친구에게 송금하듯' 친근한 텍스트로 사용자의 지갑을 엽니다. 같은 기능이라도 어떻게 카피를 쓰느냐에 따라 사용자 클릭율(CTR)은 최소 20%에서 최대 300%까지 차이를 보입니다.\n\n대다수 커머스나 테크 제품들이 공급자 중심의 차가운 텍스트를 고집할 때, 토스가 보여준 '사용자 중심 카피 라이팅' 원칙을 A/B 테스트 지표와 함께 낱낱이 파헤쳐 봅니다. 여러분의 웹서비스 문구 하나만 바꾸어도 매출이 즉시 오를 수 있는 실전 팁을 제공합니다.\n\n### 1. '수수료 면제' 대신 '송금 수수료는 0원입니다'\n어려운 한자어나 업계 전문어는 사용자에게 심리적 저항선을 만듭니다. 토스는 '예치', '송금', '이율'과 같은 한자어를 가능한 피하고 '돈 보관하기', '보내기', '쌓이는 이자' 처럼 초등학생도 직관적으로 이해할 수 있는 구어체를 적극 채택했습니다. 카피를 직관적으로 변경한 것만으로 가입 완료 단계 이탈율이 24% 감소했습니다.\n\n### 2. 수동적 동의 유도가 아닌 능동적 행동 선언\n마케팅 수신 동의 팝업창에서 흔히 보는 '동의함' 대신, 토스는 사용자가 직접 얻을 혜택을 명시합니다. 예를 들면 `[혜택 안내 동의]` 버튼 대신 `[매주 무료 포인트 받기]`로 문구를 교체했습니다. 이 작은 마이크로 카피 수정으로 동의율이 42%에서 88%로 증가하는 놀라운 성과를 거두었습니다. 사용자는 행동의 규격이 아니라 자신이 얻을 결과물에 반응합니다."
  },
  {
    id: "post-4",
    creator_id: MOCK_CREATORS.scaleup.id,
    creator_name: MOCK_CREATORS.scaleup.name,
    creator_avatar: MOCK_CREATORS.scaleup.avatar,
    title: "실리콘밸리 VC들이 지금 당장 돈을 싸들고 가는 SaaS 비즈니스 3가지",
    category: "비즈니스",
    is_premium: true,
    status: "published",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    preview_content: "2026년 현재 미국 벤처투자 시장은 혹한기 속에서도 특정 버티컬 SaaS(Software as a Service) 영역에는 역대 최고 밸류에이션으로 투자금이 몰리고 있습니다. 투자 유치가 힘든 혹한기라 하지만, 이 기업들은 연간 반복 매출(ARR)의 30배가 넘는 가치를 평가받고 있습니다.\n\n이들이 집중하는 영역은 어디이며, 왜 테크 공룡들이 아닌 스타트업이 이 기회를 포착하고 있는 것일까요? 글로벌 VC들의 투자 집행 리포트와 실제 딜 케이스 분석을 통해 국내 창업가들이 벤치마킹할 수 있는 유망 SaaS 카테고리 3가지를 명확한 데이터와 함께 소개합니다.",
    content: "2026년 현재 미국 벤처투자 시장은 혹한기 속에서도 특정 버티컬 SaaS(Software as a Service) 영역에는 역대 최고 밸류에이션으로 투자금이 몰리고 있습니다. 투자 유치가 힘든 혹한기라 하지만, 이 기업들은 연간 반복 매출(ARR)의 30배가 넘는 가치를 평가받고 있습니다.\n\n이들이 집중하는 영역은 어디이며, 왜 테크 공룡들이 아닌 스타트업이 이 기회를 포착하고 있는 것일까요? 글로벌 VC들의 투자 집행 리포트와 실제 딜 케이스 분석을 통해 국내 창업가들이 벤치마킹할 수 있는 유망 SaaS 카테고리 3가지를 명확한 데이터와 함께 소개합니다.\n\n### 1. AI 기반의 레거시 산업 자동화 (Vertical AI for Legacy Industries)\n그동안 디지털 전환(DX)이 느렸던 화물 물류, 건설 현장 관리, 노년층 헬스케어 인프라 등 틈새 시장을 노리는 AI입니다. 범용 거대언어모델(LLM)이 해결할 수 없는 산업군별 특화 데이터를 가공하여, 복잡한 양식의 결재나 수작업 정산을 클릭 한 번으로 끝내주는 전용 AI 워크플로우 솔루션이 폭발적으로 지배력을 넓히고 있습니다.\n\n### 2. 규제 준수 및 보안 자동화 (RegTech & Compliance)\n생성형 AI 사용이 기업 내에서 급증함에 따라 개인정보 유출 방지 및 정부 규제 가이드라인을 실시간으로 감시하고 감사 보고서를 자동 생성해 주는 SaaS 비즈니스가 매우 높은 가치로 거래됩니다. 미국의 경우 HIPAA, SOC2 인증 프로세스를 수작업 없이 AI가 상시 모니터링하여 자동 통과하도록 돕는 플랫폼의 성장이 두드러집니다."
  }
];

const INITIAL_PAYOUTS: Payout[] = [
  {
    id: "payout-1",
    creator_id: MOCK_CREATORS.debbie.id,
    creator_name: MOCK_CREATORS.debbie.name,
    amount: 17820, // 2 subs * 9,900 * 0.9
    status: "paid",
    bank_name: MOCK_CREATORS.debbie.bank_name,
    account_number: MOCK_CREATORS.debbie.account_number,
    account_holder: MOCK_CREATORS.debbie.account_holder,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    paid_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "payout-2",
    creator_id: MOCK_CREATORS.scaleup.id,
    creator_name: MOCK_CREATORS.scaleup.name,
    amount: 8910, // 1 sub * 9,900 * 0.9
    status: "paid",
    bank_name: MOCK_CREATORS.scaleup.bank_name,
    account_number: MOCK_CREATORS.scaleup.account_number,
    account_holder: MOCK_CREATORS.scaleup.account_holder,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    paid_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "payout-3",
    creator_id: MOCK_CREATORS.copymaster.id,
    creator_name: MOCK_CREATORS.copymaster.name,
    amount: 8910,
    status: "pending",
    bank_name: MOCK_CREATORS.copymaster.bank_name,
    account_number: MOCK_CREATORS.copymaster.account_number,
    account_holder: MOCK_CREATORS.copymaster.account_holder,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile>(INITIAL_PROFILES.reader);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>(INITIAL_PAYOUTS);

  // Load from localStorage if present to make demo persistent
  useEffect(() => {
    const localUser = localStorage.getItem("ib_user");
    const localPosts = localStorage.getItem("ib_posts");
    const localSubs = localStorage.getItem("ib_subscriptions");
    const localPayments = localStorage.getItem("ib_payments");
    const localPayouts = localStorage.getItem("ib_payouts");

    if (localUser) setCurrentUser(JSON.parse(localUser));
    if (localPosts) setPosts(JSON.parse(localPosts));
    if (localSubs) setSubscriptions(JSON.parse(localSubs));
    if (localPayments) setPayments(JSON.parse(localPayments));
    if (localPayouts) setPayouts(JSON.parse(localPayouts));
  }, []);

  const saveToStorage = (
    user: Profile,
    updatedPosts: Post[],
    updatedSubs: Subscription[],
    updatedPay: Payment[],
    updatedPayouts: Payout[]
  ) => {
    localStorage.setItem("ib_user", JSON.stringify(user));
    localStorage.setItem("ib_posts", JSON.stringify(updatedPosts));
    localStorage.setItem("ib_subscriptions", JSON.stringify(updatedSubs));
    localStorage.setItem("ib_payments", JSON.stringify(updatedPay));
    localStorage.setItem("ib_payouts", JSON.stringify(updatedPayouts));
  };

  const toggleRole = () => {
    let nextUser = INITIAL_PROFILES.reader;
    if (currentUser.role === "reader") {
      nextUser = INITIAL_PROFILES.creator;
    } else if (currentUser.role === "creator") {
      nextUser = INITIAL_PROFILES.admin;
    } else {
      nextUser = INITIAL_PROFILES.reader;
    }
    setCurrentUser(nextUser);
    localStorage.setItem("ib_user", JSON.stringify(nextUser));
  };

  const publishPost = (
    title: string,
    category: string,
    isPremium: boolean,
    previewContent: string,
    fullContent: string
  ) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      creator_id: currentUser.id,
      creator_name: currentUser.username,
      creator_avatar: currentUser.avatar_url,
      title,
      category,
      is_premium: isPremium,
      status: "published",
      created_at: new Date().toISOString(),
      preview_content: previewContent,
      content: fullContent
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    saveToStorage(currentUser, updatedPosts, subscriptions, payments, payouts);
  };

  const subscribeToCreator = (creatorId: string, creatorName: string, amount: number): Promise<boolean> => {
    return new Promise((resolve) => {
      // Simulate network request and PG loading
      setTimeout(() => {
        const newSub: Subscription = {
          id: `sub-${Date.now()}`,
          user_id: currentUser.id,
          creator_id: creatorId,
          status: "active",
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        const newPay: Payment = {
          id: `pay-${Date.now()}`,
          user_id: currentUser.id,
          amount,
          status: "paid",
          pg_tid: `TOSS_TID_${Math.floor(Math.random() * 100000000)}`,
          created_at: new Date().toISOString(),
          creator_name: creatorName
        };

        const updatedSubs = [...subscriptions, newSub];
        const updatedPayments = [newPay, ...payments];

        // Create pending payout for creator (90% amount)
        const creatorDetails = Object.values(MOCK_CREATORS).find(c => c.id === creatorId);
        const bankNameVal = creatorDetails?.bank_name || "신한은행";
        const accountNumVal = creatorDetails?.account_number || "110-384-293847";
        const holderVal = creatorDetails?.account_holder || creatorName.split(" ")[0];

        const newPayout: Payout = {
          id: `payout-${Date.now()}`,
          creator_id: creatorId,
          creator_name: creatorName,
          amount: Math.round(amount * 0.9), // 90%
          status: "pending",
          bank_name: bankNameVal,
          account_number: accountNumVal,
          account_holder: holderVal,
          created_at: new Date().toISOString()
        };

        const updatedPayouts = [newPayout, ...payouts];

        setSubscriptions(updatedSubs);
        setPayments(updatedPayments);
        setPayouts(updatedPayouts);
        saveToStorage(currentUser, posts, updatedSubs, updatedPayments, updatedPayouts);
        resolve(true);
      }, 1500);
    });
  };

  const cancelSubscription = (creatorId: string) => {
    const updatedSubs = subscriptions.filter(sub => sub.creator_id !== creatorId);
    setSubscriptions(updatedSubs);
    saveToStorage(currentUser, posts, updatedSubs, payments, payouts);
  };

  const updatePayoutAccount = (bankName: string, accountNumber: string, accountHolder: string) => {
    const updatedUser: Profile = {
      ...currentUser,
      bank_name: bankName,
      account_number: accountNumber,
      account_holder: accountHolder
    };
    setCurrentUser(updatedUser);
    saveToStorage(updatedUser, posts, subscriptions, payments, payouts);
  };

  const executePayout = (payoutId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Simulate corporate firm banking transfer delay
      setTimeout(() => {
        const updatedPayouts = payouts.map((p) => {
          if (p.id === payoutId) {
            return {
              ...p,
              status: "paid" as const,
              paid_at: new Date().toISOString()
            };
          }
          return p;
        });
        setPayouts(updatedPayouts);
        saveToStorage(currentUser, posts, subscriptions, payments, updatedPayouts);
        resolve(true);
      }, 1200);
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        posts,
        subscriptions,
        payments,
        payouts,
        setCurrentUser,
        toggleRole,
        publishPost,
        subscribeToCreator,
        cancelSubscription,
        updatePayoutAccount,
        executePayout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
