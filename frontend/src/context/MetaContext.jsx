import { createContext, useContext, useEffect, useState } from "react";

import { metaApi } from "@/api/endpoints";

/** بيانات ثابتة من الخادم: معلومات المنصة وترجمة التعدادات */
const MetaContext = createContext(null);

const FALLBACK = {
  site: {
    name: "منحتي",
    name_en: "Minhati",
    tagline: "منصة عربية للطلاب والباحثين عن المنح",
    description:
      "منحتي منصة تساعد الطلاب والباحثين على اكتشاف المنح المناسبة، وتجهيز طلباتهم، ومتابعة مواعيد التقديم باستخدام تقنيات ذكية تجعل رحلة البحث والتقديم أسهل.",
    email: "Menhati@gmail.com",
    phone: "0592983443",
    address: "فلسطين، غزة",
  },
  enums: {},
  uploads: { mimes: ["pdf", "doc", "docx", "png", "jpg", "jpeg"] },
};

export function MetaProvider({ children }) {
  const [meta, setMeta] = useState(FALLBACK);

  useEffect(() => {
    let cancelled = false;

    metaApi
      .meta()
      .then((data) => {
        if (!cancelled) setMeta(data);
      })
      .catch(() => {
        // يبقى الاحتياطي — الواجهة تعمل حتى لو تعذّر جلب البيانات الثابتة
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return <MetaContext.Provider value={meta}>{children}</MetaContext.Provider>;
}

export function useMeta() {
  return useContext(MetaContext) ?? FALLBACK;
}

/** خيارات تعداد جاهزة للقوائم المنسدلة */
export function useEnum(name) {
  const meta = useMeta();
  return meta.enums?.[name] ?? [];
}
