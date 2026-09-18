import { useEffect, useState } from "react";

/** ارتفاع شريط الترويسة — النطاق الذي يمرّ المحتوى تحته */
const HEADER_HEIGHT = 64;

/**
 * هل يمرّ سطحٌ داكن تحت الترويسة الآن؟
 *
 * الترويسة زجاج شديد الشفافية، فلون ما خلفها هو خلفية نصّها فعلياً. وفوق
 * بطل كحلي لا يتجاوز تباين النصّ الداكن 3.2:1 مهما ضُبط التعتيم والتمويه —
 * قِيس ذلك على ثماني تركيبات. فالحلّ أن يقلب النصّ إلى الأبيض هناك بدل أن
 * نضحّي بالشفافية في الصفحة كلّها.
 *
 * تُوسَم الأسطح المعنيّة بـ data-header-dark.
 */
export function useHeaderOverDark() {
  const [overDark, setOverDark] = useState(false);

  useEffect(() => {
    let frame = null;

    const measure = () => {
      frame = null;

      const surfaces = document.querySelectorAll("[data-header-dark]");
      let covered = false;

      for (const surface of surfaces) {
        const rect = surface.getBoundingClientRect();

        // السطح يغطّي شريط الترويسة إن بدأ فوقه وامتدّ إلى داخله
        if (rect.top <= 0 && rect.bottom >= HEADER_HEIGHT) {
          covered = true;
          break;
        }
      }

      setOverDark(covered);
    };

    // المراقبة على كل إطار تمرير مُهدرة، فنؤجّلها إلى إطار الرسم
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    /*
     * الأسطح تظهر بعد جلب البيانات لا مع أول رسم، ويتغيّر ارتفاعها بعده،
     * فنراقب شجرة المستند بدل الاكتفاء بقياسٍ واحد عند التركيب.
     */
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, []);

  return overDark;
}
