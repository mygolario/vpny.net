import { useState } from 'react';
import { ChevronDown, AlertTriangle, ShieldCheck, Heart, Info, RotateCcw } from 'lucide-react';

const NOTICES = [
  {
    title: '۱. عدم امکان تضمین یا پیش‌بینی وضعیت فیلترینگ',
    icon: AlertTriangle,
    content: 'پیش‌بینی وضعیت فیلترینگ غیرممکن است. ما (VPNy) هیچ‌گونه امکان پیش‌بینی یا تضمین بابت وضعیت فیلترینگ اینترنت در منطقه جغرافیایی، اپراتور اینترنت خط ثابت یا تلفن همراه یا بازه زمانی خاصی را نداریم. لطفاً بلافاصله پس از دریافت اکانت، اتصال را روی تمام اپراتورها و دستگاه‌های مورد نظر خود تست نمایید. امکان تست تا حداکثر ۲۴ ساعت یا ۱ گیگابایت ترافیک (هر کدام زودتر محقق شود) برای شما فراهم است. در صورت عدم رضایت، طی این بازه می‌توانید درخواست بازگشت وجه بدهید. پس از گذشت این مدت یا مصرف ترافیک، فرض بر رضایت شماست و امکان مرجوعی وجود ندارد.'
  },
  {
    title: '۲. نوسان و تغییرات اتصال در شهرها و اپراتورها',
    icon: Info,
    content: 'وضعیت اتصال متغیر است. اگر در شهری خاص و با اپراتور مشخص اتصال برقرار بود، هیچ تضمینی وجود ندارد که در شهر یا منطقه‌ی دیگر، حتی با همان اپراتور و در همان زمان نیز اتصال موفق باشد. رفتار اپراتورها و سیاست‌های فیلترینگ ممکن است به صورت لحظه‌ای و منطقه‌ای تغییر کند، که خارج از کنترل ماست.'
  },
  {
    title: '۳. اولویت پشتیبانی در شرایط اضطراری (بحران سراسری)',
    icon: Heart,
    content: 'در شرایط خاص (فورس ماژور، جنگ، بحران سراسری و...)، تمرکز و تلاش تیم ما بر پشتیبانی عمومی برای اتصال حداکثری کاربران به اینترنت آزاد خواهد بود و پاسخ‌گویی به درخواست‌های فردی در اولویت نخواهد بود.'
  },
  {
    title: '۴. شرایط انسداد کامل (اینترنت ملی)',
    icon: AlertTriangle,
    content: 'در صورت اجرای اینترنت ملی یا قطع گسترده اینترنت بین‌الملل، خدمات ما نیز محدود خواهد شد. در صورت اعمال محدودیت‌های سراسری از سوی دولت یا اپراتورها (اعم از اینترنت ملی، DPI، قطع اینترنت بین‌الملل و...)، ما نیز در ارائه خدمات ناتوان خواهیم بود و این موضوع از تعهدات ما خارج است.'
  },
  {
    title: '۵. گارانتی آپ‌تایم ۹۹٪ شبکه سرورها',
    icon: ShieldCheck,
    content: 'ما اپ‌تایم ۹۹٪ سرویس‌ها را گارانتی می‌کنیم. آپ‌تایم ۹۹٪ یعنی از ۷۲۰ ساعت کارکرد ماهانه، عدم سرویس‌دهی می‌تواند به اندازه‌ی ۷ ساعت و ۱۲ دقیقه در ماه باشد، و زمان بیشتر از آن کاربر حق دارد درخواست فسخ سرویس را ایمیل کند. داون‌تایم نسبت به کل دوره‌ی استفاده یعنی از لحظه‌ی شروع تا پایان داون‌تایمِ احتمالی، سنجیده می‌شود. در صورت فسخ سرویس، مبلغ پرداختی کاربر متناسب با زمان و یا ترافیک مصرفی (هر کدام بیشتر باشد) کسر و باقیمانده به کاربر مسترد می‌شود.'
  },
  {
    title: '۶. تعهد تعویض آی‌پی‌های فیلتر شده',
    icon: RotateCcw,
    content: 'رفع مشکل بلاک‌شدن سرورها و فیلترشدن IP ها در تعهد ما است. در شرایط فیلترینگ معمولی، در صورت فیلترشدن IP یِ سرورها از سمت اپراتورها، بلافاصله از سمت ما برای جایگزینی IP یا سرور جدید اقدام می‌شود. این کار ممکن است حدود ۱۲ الی ۲۴ ساعت زمان ببرد. این زمان جزو زمان داون‌تایم سرورها محاسبه نمی‌شود.'
  }
];

export default function PersianNotices() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq-section" className="persian">
      <div className="container">
        {/* Section header */}
        <div className="section-header reveal">
          <span className="section-label" style={{ fontFamily: 'var(--font-fa)' }}>قوانین و نکات مهم خرید</span>
          <h2 className="section-title" style={{ fontFamily: 'var(--font-fa)' }}>توافق‌نامه سطح خدمات (SLA)</h2>
          <p className="section-subtitle" style={{ fontFamily: 'var(--font-fa)' }}>
            خواهشمند است پیش از ثبت هرگونه سفارش خرید، ضوابط، قوانین و گارانتی بازگشت وجه را با دقت مطالعه فرمایید.
          </p>
        </div>

        <div className="persian__grid reveal">
          {/* Official channels summary */}
          <div className="card persian__channels">
            <h3 className="persian__channels-title">کانال‌های اطلاع‌رسانی رسمی</h3>
            <p className="persian__channels-desc">
              کلیه‌ی اطلاعیه‌ها، قطعی‌ها، به‌روزرسانی‌های نرم‌افزاری و کدهای تخفیف دوره‌ای صرفاً از طریق مراجع رسمی زیر اعلام می‌گردد. بررسی دوره‌ای این منابع بر عهده کاربر است.
            </p>
            <ul className="persian__channels-list">
              <li className="persian__channel-item">
                <span className="persian__channel-name">داشبورد کاربری</span>
                <span className="persian__channel-link">بخش اطلاعیه‌ها</span>
              </li>
              <li className="persian__channel-item">
                <span className="persian__channel-name">کانال تلگرام رسمی</span>
                <a href="https://t.me/VPNynet" target="_blank" rel="noopener noreferrer" className="persian__channel-link">@VPNynet</a>
              </li>
              <li className="persian__channel-item">
                <span className="persian__channel-name">اکانت توییتر (X)</span>
                <a href="https://x.com/VPNynet" target="_blank" rel="noopener noreferrer" className="persian__channel-link">@VPNynet</a>
              </li>
            </ul>
          </div>

          {/* Accordion list */}
          <div className="card persian__accordion">
            {NOTICES.map((notice, idx) => {
              const ItemIcon = notice.icon;
              return (
                <div key={idx} className={`persian__accordion-item ${openIndex === idx ? 'persian__accordion-item--open' : ''}`}>
                  <div className="persian__accordion-header" onClick={() => toggleAccordion(idx)}>
                    <div className="persian__accordion-title">
                      <ItemIcon size={18} className="persian__accordion-title-icon" />
                      <span>{notice.title}</span>
                    </div>
                    <ChevronDown size={18} className="persian__accordion-chevron" />
                  </div>
                  <div className="persian__accordion-content">
                    <p className="persian__accordion-text">{notice.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
