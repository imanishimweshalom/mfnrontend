
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import {
  PopularItem,
  SectionLabel,
  NewsletterWidget,
  WhatsAppCTA,
  Spinner,
  EmptyState,
  imgUrl,
  timeAgo
} from '../../components/ui';
import { storiesAPI, commentsAPI, adsAPI } from '../../utils/api';

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect width='800' height='450' fill='%23e8e4d8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23bbb'%3ENo Image%3C/text%3E%3C/svg%3E";

/* =============================================================
   AdCard — supports BOTH Video and Image
============================================================= */
const AdCard = React.memo(function AdCard({
  ad,
  height = 180,
  fluid = false,
  className = ''
}) {
  if (!ad) return null;

  const rawMedia =
    ad.image_url ||
    ad.imageUrl ||
    ad.image ||
    ad.banner ||
    ad.bannerUrl ||
    ad.img ||
    ad.file_url ||
    ad.photo ||
    ad.file ||
    ad.banner_image ||
    ad.ad_image;

  const media = rawMedia ? imgUrl(rawMedia) : null;

  const isVideo =
    ad.type === 'video' ||
    (rawMedia &&
      /\.(mp4|webm|ogg|mov)$/i.test(rawMedia));

  const link =
    ad.link ||
    ad.url ||
    ad.click_url ||
    ad.target_url ||
    ad.ad_url ||
    '#';

  const title =
    ad.title ||
    ad.name ||
    ad.ad_title ||
    'Sponsored';

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`mhk-ad-card ${className}`}
      style={{
        width: '100%',
        height: fluid ? '100%' : height,
        textDecoration: 'none',
        background: '#fff',
        marginBottom: fluid ? 0 : 12,
        flex: fluid ? 1 : 'unset'
      }}
    >
      {media ? (
        isVideo ? (
          <video
            src={media}
            autoPlay
            muted
            loop
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              flex: 1
            }}
          />
        ) : (
          <img
            src={media}
            alt={title}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = PLACEHOLDER;
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              flex: 1
            }}
          />
        )
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#bbb',
            fontFamily:
              "'Barlow Condensed', sans-serif",
            fontSize: 14,
            flex: 1,
            background: '#f8f9fa',
            padding: 10,
            textAlign: 'center'
          }}
        >
          <span
            style={{
              fontWeight: 700,
              marginBottom: 4
            }}
          >
            {title}
          </span>

          <small
            style={{
              fontSize: 10,
              opacity: 0.7
            }}
          >
            Ad Space Available
          </small>
        </div>
      )}

      <div
        style={{
          padding: '4px 10px',
          fontFamily:
            "'Barlow Condensed', sans-serif",
          fontSize: 8,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: '#bbb',
          background: '#f0ece0',
          borderTop:
            '1px solid #e8e4d8'
        }}
      >
        Advertisement
      </div>
    </a>
  );
});

/* =============================================================
   STORY PAGE
============================================================= */
export default function StoryPage() {
  const { id } = useParams();

  const [story, setStory] = useState(null);
  const [related, setRelated] = useState([]);
  const [comments, setComments] = useState([]);
  const [popular, setPopular] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: '',
    email: '',
    comment: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [commentMsg, setCommentMsg] = useState('');
  const [refreshingComments, setRefreshingComments] =
    useState(false);
  const [showCommentModal, setShowCommentModal] =
    useState(false);
  const [adIndex, setAdIndex] = useState(0);

  const [reactions, setReactions] = useState({
    likes: 0,
    dislikes: 0,
    love: 0,
    laugh: 0,
    wow: 0,
    sad: 0,
    angry: 0,
    celebrate: 0
  });

  const [userReaction, setUserReaction] =
    useState(null);

  /* -------- LOAD DATA -------- */

  useEffect(() => {
    window.scrollTo(0, 0);

    const load = async () => {
      setLoading(true);

      try {
        const [
          sRes,
          cRes,
          pRes,
          aRes
        ] = await Promise.all([
          storiesAPI.getOne(id),
          commentsAPI.getByStory(id),
          storiesAPI.getPopular({
            limit: 5
          }),
          adsAPI.getAll()
        ]);

        const s = sRes.data;

        setStory(s);

        setReactions({
          likes: Number(s.likes || 0),
          dislikes: Number(
            s.dislikes || 0
          ),
          love: Number(
            s.love || s.loves || 0
          ),
          laugh: Number(
            s.laugh || s.laughs || 0
          ),
          wow: Number(s.wow || 0),
          sad: Number(s.sad || 0),
          angry: Number(
            s.angry || 0
          ),
          celebrate: Number(
            s.celebrate || 0
          )
        });

        const rawC = cRes.data;

        setComments(
          Array.isArray(rawC)
            ? rawC
            : rawC?.comments ||
              rawC?.data ||
              []
        );

        const rawP = pRes.data;

        setPopular(
          Array.isArray(rawP)
            ? rawP
            : rawP?.stories ||
              rawP?.data ||
              []
        );

        const rawA = aRes.data;

        setAds(
          Array.isArray(rawA)
            ? rawA
            : rawA?.ads ||
              rawA?.data ||
              rawA?.items ||
              []
        );

        const relRes =
          await storiesAPI.getAll({
            category: s.category,
            limit: 5,
            status: 'published'
          });

        const relArr =
          Array.isArray(relRes.data)
            ? relRes.data
            : relRes.data?.stories ||
              relRes.data?.data ||
              [];

        setRelated(
          relArr
            .filter(
              (r) =>
                String(
                  r._id || r.id
                ) !== String(id)
            )
            .slice(0, 4)
        );
      } catch (e) {
        console.error(
          'Story loading failed:',
          e
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  /* -------- ADS LOGIC -------- */

  const activeAds = useMemo(
    () =>
      (ads || []).filter(
        (a) =>
          a &&
          a.is_active !== false &&
          a.status !== 'inactive' &&
          a.status !== 'paused' &&
          a.status !== 'draft'
      ),
    [ads]
  );

  const heroAd = useMemo(
    () =>
      activeAds.find(
        (a) =>
          String(
            a.position ||
              a.placement ||
              ''
          ).toLowerCase() ===
          'hero'
      ) || null,
    [activeAds]
  );

  const leftAds = useMemo(() => {
    const p = activeAds.filter(
      (a) =>
        String(
          a.position ||
            a.placement ||
            ''
        ).toLowerCase() ===
        'left'
    );

    return p.length > 0
      ? p.slice(0, 3)
      : activeAds.slice(0, 3);
  }, [activeAds]);

  const rightAds = useMemo(() => {
    const p = activeAds.filter(
      (a) =>
        String(
          a.position ||
            a.placement ||
            ''
        ).toLowerCase() ===
        'right'
    );

    return p.length > 0
      ? p.slice(0, 3)
      : activeAds.slice(3, 6)
          .length > 0
        ? activeAds.slice(3, 6)
        : activeAds.slice(0, 3);
  }, [activeAds]);

  const inlineAds = useMemo(() => {
    const p = activeAds.filter(
      (a) =>
        String(
          a.position ||
            a.placement ||
            ''
        ).toLowerCase() ===
        'inline'
    );

    return p.length > 0
      ? p.slice(0, 3)
      : activeAds.slice(2, 5);
  }, [activeAds]);

  const floatAds = useMemo(() => {
    const p = activeAds.filter(
      (a) =>
        String(
          a.position ||
            a.placement ||
            ''
        ).toLowerCase() ===
        'bottom'
    );

    return p.length > 0
      ? p.slice(0, 3)
      : activeAds.slice(0, 3);
  }, [activeAds]);

  useEffect(() => {
    if (floatAds.length === 0) return;

    const t = setInterval(() => {
      setAdIndex(
        (p) =>
          (p + 1) %
          floatAds.length
      );
    }, 8000);

    return () => clearInterval(t);
  }, [floatAds]);

  useEffect(() => {
    document.body.style.overflow =
      showCommentModal
        ? 'hidden'
        : '';

    return () => {
      document.body.style.overflow =
        '';
    };
  }, [showCommentModal]);

  useEffect(() => {
    const k = (e) => {
      if (e.key === 'Escape') {
        setShowCommentModal(false);
      }
    };

    if (showCommentModal) {
      window.addEventListener(
        'keydown',
        k
      );
    }

    return () =>
      window.removeEventListener(
        'keydown',
        k
      );
  }, [showCommentModal]);

  /* -------- REACTIONS -------- */

  const handleReact = async (type) => {
    if (!type) return;

    if (userReaction === type) {
      return;
    }

    const previousReaction =
      userReaction;

    setReactions((prev) => ({
      ...prev,
      [type]:
        (prev[type] || 0) + 1
    }));

    setUserReaction(type);

    try {
      const res =
        await storiesAPI.react(
          id,
          type
        );

      if (res?.data) {
        setReactions((prev) => ({
          ...prev,
          ...res.data
        }));
      }
    } catch (e) {
      setReactions((prev) => ({
        ...prev,
        [type]: Math.max(
          0,
          (prev[type] || 0) - 1
        )
      }));

      setUserReaction(
        previousReaction
      );

      console.error(
        'Reaction save failed:',
        e
      );
    }
  };

  /* ============================================================
     SOCIAL SHARE SYSTEM
  ============================================================ */

  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : '';

  const shareTitle =
    story?.title ||
    'Mahoko Friday News';

  const shareText =
    `${shareTitle} - Mahoko Friday News`;

  /* -------- COPY LINK -------- */

  const handleCopyLink = async () => {
    try {
      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(
          shareUrl
        );
      } else {
        const textArea =
          document.createElement(
            'textarea'
          );

        textArea.value =
          shareUrl;

        textArea.style.position =
          'fixed';
        textArea.style.left =
          '-999999px';
        textArea.style.top =
          '-999999px';

        document.body.appendChild(
          textArea
        );

        textArea.focus();
        textArea.select();

        document.execCommand(
          'copy'
        );

        document.body.removeChild(
          textArea
        );
      }

      setCommentMsg(
        '🔗 Link copied successfully!'
      );

      setTimeout(
        () => setCommentMsg(''),
        2500
      );
    } catch (error) {
      console.error(
        'Copy link failed:',
        error
      );

      setCommentMsg(
        '❌ Failed to copy link.'
      );

      setTimeout(
        () => setCommentMsg(''),
        3000
      );
    }
  };

  /* -------- NATIVE SHARE -------- */

  const handleNativeShare =
    async () => {
      try {
        if (
          navigator.share &&
          typeof navigator.share ===
            'function'
        ) {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl
          });
        } else {
          await handleCopyLink();
        }
      } catch (error) {
        if (
          error?.name !==
          'AbortError'
        ) {
          console.error(
            'Native share failed:',
            error
          );
        }
      }
    };

  /* -------- SHARE POPUP -------- */

  const openShareWindow = (
    url,
    name
  ) => {
    const width = 650;
    const height = 650;

    const left =
      window.screenX +
      Math.max(
        0,
        (window.outerWidth -
          width) /
          2
      );

    const top =
      window.screenY +
      Math.max(
        0,
        (window.outerHeight -
          height) /
          2
      );

    const popup = window.open(
      url,
      name,
      `width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`
    );

    if (popup) {
      popup.focus();
    }
  };

  /* -------- FACEBOOK -------- */

  const shareToFacebook = () => {
    const url =
      `https://www.facebook.com/sharer/sharer.php?u=` +
      encodeURIComponent(
        shareUrl
      );

    openShareWindow(
      url,
      'facebook-share'
    );
  };

  /* -------- X / TWITTER -------- */

  const shareToX = () => {
    const url =
      `https://twitter.com/intent/tweet?url=` +
      encodeURIComponent(
        shareUrl
      ) +
      `&text=` +
      encodeURIComponent(
        shareTitle
      );

    openShareWindow(
      url,
      'x-share'
    );
  };

  /* -------- WHATSAPP -------- */

  const shareToWhatsApp = () => {
    const text =
      `${shareText}\n${shareUrl}`;

    const url =
      `https://wa.me/?text=` +
      encodeURIComponent(text);

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );
  };

  /* -------- TELEGRAM -------- */

  const shareToTelegram = () => {
    const url =
      `https://t.me/share/url?url=` +
      encodeURIComponent(
        shareUrl
      ) +
      `&text=` +
      encodeURIComponent(
        shareTitle
      );

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );
  };

  /* -------- LINKEDIN -------- */

  const shareToLinkedIn = () => {
    const url =
      `https://www.linkedin.com/sharing/share-offsite/?url=` +
      encodeURIComponent(
        shareUrl
      );

    openShareWindow(
      url,
      'linkedin-share'
    );
  };

  /* -------- EMAIL -------- */

  const shareByEmail = () => {
    const subject =
      encodeURIComponent(
        shareTitle
      );

    const body =
      encodeURIComponent(
        `${shareText}\n\n${shareUrl}`
      );

    window.location.href =
      `mailto:?subject=${subject}&body=${body}`;
  };

  /* -------- SMS -------- */

  const shareBySMS = () => {
    const body =
      encodeURIComponent(
        `${shareText} ${shareUrl}`
      );

    window.location.href =
      `sms:?body=${body}`;
  };

  /* -------- COMMENT HANDLER -------- */

  const handleComment = async (
    e
  ) => {
    e.preventDefault();

    setSubmitting(true);
    setCommentMsg('');

    try {
      await commentsAPI.create({
        story_id: id,
        ...form
      });

      setCommentMsg(
        '✅ Comment submitted for review!'
      );

      setForm({
        name: '',
        email: '',
        comment: ''
      });

      setRefreshingComments(true);

      try {
        const cRes =
          await commentsAPI.getByStory(
            id
          );

        const r = cRes.data;

        setComments(
          Array.isArray(r)
            ? r
            : r?.comments ||
              r?.data ||
              []
        );
      } catch (_) {
      } finally {
        setRefreshingComments(
          false
        );
      }

      setTimeout(
        () => setCommentMsg(''),
        4000
      );
    } catch (error) {
      console.error(
        'Comment submission failed:',
        error
      );

      setCommentMsg(
        '❌ Error submitting. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'center'
          }}
        >
          <Spinner />
        </div>
      </PublicLayout>
    );
  }

  if (!story) {
    return (
      <PublicLayout>
        <EmptyState />
      </PublicLayout>
    );
  }

  const authorAvatar =
    story.author_avatar ||
    story.author_image;

  /* -------- 8 REACTIONS -------- */

  const reactionButtons = [
    {
      type: 'likes',
      emoji: '👍'
    },
    {
      type: 'love',
      emoji: '❤️'
    },
    {
      type: 'laugh',
      emoji: '😂'
    },
    {
      type: 'wow',
      emoji: '😮'
    },
    {
      type: 'sad',
      emoji: '😢'
    },
    {
      type: 'angry',
      emoji: '😡'
    },
    {
      type: 'celebrate',
      emoji: '👏'
    },
    {
      type: 'dislikes',
      emoji: '👎'
    }
  ];

  return (
    <PublicLayout>
      <style>{`
        @keyframes mhkFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes mhkPop {
          from {
            transform: translateY(40px) scale(.98);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes mhkSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes mhkAdFade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mhk-modal-bg {
          animation: mhkFade .25s ease-out forwards;
        }

        .mhk-modal-card {
          animation: mhkPop .3s cubic-bezier(.2,.8,.2,1) forwards;
        }

        .mhk-spin {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid #fff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: mhkSpin .6s linear infinite;
        }

        .story-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 16px;
        }

        .story-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }

        .story-left-col {
          display: none;
        }

        .story-main-col {
          min-width: 0;
        }

        .story-right-col {
          display: none;
        }

        .story-body-text::first-letter {
          float: left;
          font-size: 4em;
          line-height: 0.8;
          padding-right: 10px;
          padding-top: 6px;
          font-family: 'Playfair Display', serif;
          color: #c0392b;
          font-weight: 900;
        }

        .mhk-react-btn {
          transition: all .2s ease;
          user-select: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: #f0ece0;
          border: 1px solid #e8e4d8;
          border-radius: 3px;
          cursor: pointer;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 11px;
        }

        .mhk-react-btn:hover {
          background: #e8e4d8 !important;
          transform: translateY(-1px);
        }

        .mhk-react-btn:active {
          transform: scale(.96);
        }

        .mhk-react-btn.active {
          background: #fdf0ee !important;
          border-color: #c0392b !important;
          color: #c0392b !important;
        }

        .mhk-share-btn {
          transition: all .2s ease;
          white-space: nowrap;
        }

        .mhk-share-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(0,0,0,.18);
        }

        .mhk-share-btn:active {
          transform: scale(.96);
        }

        .mhk-ad-card {
          transition: transform .3s ease, box-shadow .3s ease;
          border: 1px solid #e8e4d8;
          border-radius: 6px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .mhk-ad-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 18px rgba(0,0,0,.1);
        }

        .mhk-ad-card img,
        .mhk-ad-card video {
          transition: transform .4s ease;
        }

        .mhk-ad-card:hover img,
        .mhk-ad-card:hover video {
          transform: scale(1.04);
        }

        .mhk-float-fade {
          animation: mhkAdFade .5s ease;
          display: flex;
          gap: 16px;
          width: 100%;
          align-items: stretch;
        }

        .mhk-float-extra {
          display: none;
          flex: 1;
        }

        .mhk-related-card {
          transition: transform .25s ease, box-shadow .25s ease;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid #e8e4d8;
          background: #fff;
        }

        .mhk-related-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,.08);
        }

        .mhk-related-card img {
          transition: transform .4s ease;
        }

        .mhk-related-card:hover img {
          transform: scale(1.05);
        }

        .mhk-comment-row {
          transition: background .2s;
        }

        .mhk-comment-row:hover {
          background: rgba(240,236,224,.5);
        }

        .mhk-comment-form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        @media (max-width: 767px) {
          .mhk-share-btn {
            flex: 1 1 auto;
            min-width: 80px;
          }
        }

        @media (min-width: 768px) {
          .story-grid {
            grid-template-columns: 1fr 300px;
          }

          .story-right-col {
            display: flex;
            flex-direction: column;
            gap: 20px;
            position: sticky;
            top: 80px;
            align-self: start;
            max-height: calc(100vh - 100px);
            overflow-y: auto;
          }

          .mhk-comment-form-grid {
            grid-template-columns: 1fr 1fr;
          }

          .mhk-float-extra {
            display: flex;
          }
        }

        @media (min-width: 1080px) {
          .story-grid {
            grid-template-columns: 200px 1fr 300px;
            gap: 40px;
          }

          .story-left-col {
            display: flex;
            flex-direction: column;
            gap: 16px;
            position: sticky;
            top: 80px;
            align-self: start;
            max-height: calc(100vh - 100px);
            overflow-y: auto;
          }

          .story-left-col::-webkit-scrollbar,
          .story-right-col::-webkit-scrollbar {
            width: 4px;
          }

          .story-left-col::-webkit-scrollbar-thumb,
          .story-right-col::-webkit-scrollbar-thumb {
            background: #ddd;
            border-radius: 2px;
          }
        }
      `}</style>

      <div className="story-container">

        {/* HERO AD */}
        {heroAd && (
          <div
            style={{
              marginBottom: 24,
              borderRadius: 8,
              overflow: 'hidden',
              border:
                '1px solid #e8e4d8'
            }}
          >
            <AdCard
              ad={heroAd}
              height={110}
            />
          </div>
        )}

        <div className="story-grid">

          {/* LEFT ADS */}
          {leftAds.length > 0 && (
            <aside className="story-left-col">
              <div
                style={{
                  fontFamily:
                    "'Barlow Condensed', sans-serif",
                  fontSize: 8,
                  fontWeight: 800,
                  letterSpacing: 2,
                  textTransform:
                    'uppercase',
                  color: '#bbb',
                  marginBottom: 8,
                  textAlign: 'center'
                }}
              >
                Sponsors
              </div>

              {leftAds.map(
                (ad, i) => (
                  <AdCard
                    key={
                      ad._id ||
                      ad.id ||
                      i
                    }
                    ad={ad}
                    height={220}
                  />
                )
              )}
            </aside>
          )}

          {/* MAIN STORY */}
          <main className="story-main-col">

            {/* BREADCRUMB */}
            <nav
              style={{
                display: 'flex',
                gap: 8,
                fontFamily:
                  "'Barlow Condensed', sans-serif",
                fontSize: 11,
                letterSpacing: 1.5,
                textTransform:
                  'uppercase',
                color: '#999',
                marginBottom: 16
              }}
            >
              <Link
                to="/"
                style={{
                  color: '#999',
                  textDecoration:
                    'none'
                }}
              >
                Home
              </Link>

              <span>›</span>

              <Link
                to={`/category/${story.category}`}
                style={{
                  color: '#c0392b',
                  textDecoration:
                    'none',
                  fontWeight: 700
                }}
              >
                {story.category}
              </Link>
            </nav>

            {/* TITLE */}
            <h1
              style={{
                fontFamily:
                  "'Playfair Display', Georgia, serif",
                fontSize:
                  'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 900,
                lineHeight: 1.15,
                margin: '0 0 16px',
                color: '#0d0d0d'
              }}
            >
              {story.title}
            </h1>

            {/* AUTHOR / DATE */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
                fontFamily:
                  "'Barlow Condensed', sans-serif",
                fontSize: 12,
                color: '#666',
                paddingBottom: 20,
                marginBottom: 24,
                borderBottom:
                  '1px solid #e8e4d8',
                flexWrap: 'wrap'
              }}
            >
              {authorAvatar && (
                <img
                  src={imgUrl(
                    authorAvatar
                  )}
                  alt=""
                  onError={(e) => {
                    e.target.onerror =
                      null;
                    e.target.src =
                      PLACEHOLDER;
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border:
                      '2px solid #e8e4d8'
                  }}
                />
              )}

              <div>
                <Link
                  to={`/author/${encodeURIComponent(
                    story.author
                  )}`}
                  style={{
                    fontWeight: 700,
                    textDecoration:
                      'none',
                    color: '#0d0d0d',
                    fontSize: 14
                  }}
                >
                  {story.author}
                </Link>

                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    marginTop: 2,
                    color: '#888'
                  }}
                >
                  <span>
                    {timeAgo(
                      story.created_at ||
                        story.createdAt
                    )}
                  </span>

                  <span>·</span>

                  <span>
                    👁{' '}
                    {Number(
                      story.views || 0
                    ).toLocaleString()}{' '}
                    views
                  </span>
                </div>
              </div>
            </div>

            {/* STORY IMAGE */}
            <img
              src={imgUrl(
                story.image
              )}
              alt={story.title}
              loading="eager"
              onError={(e) => {
                e.target.onerror =
                  null;
                e.target.src =
                  PLACEHOLDER;
              }}
              style={{
                width: '100%',
                height: 'auto',
                aspectRatio: '16/9',
                objectFit: 'cover',
                borderRadius: 10,
                marginBottom: 28,
                display: 'block'
              }}
            />

            {/* INLINE AD 1 */}
            {inlineAds[0] && (
              <div
                style={{
                  marginBottom: 28
                }}
              >
                <AdCard
                  ad={inlineAds[0]}
                  height={90}
                />
              </div>
            )}

            {/* STORY CONTENT */}
            <div
              className="story-body-text"
              style={{
                fontSize: '1.1rem',
                lineHeight: 1.85,
                fontFamily:
                  "'Source Serif 4', Georgia, serif",
                color: '#1a1a1a',
                marginBottom: 10
              }}
              dangerouslySetInnerHTML={{
                __html:
                  story.description
              }}
            />

            {/* INLINE AD 2 */}
            {inlineAds[1] && (
              <div
                style={{
                  margin: '28px 0'
                }}
              >
                <AdCard
                  ad={inlineAds[1]}
                  height={90}
                />
              </div>
            )}

            {/* TAGS */}
            {story.tags && (
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  margin:
                    '24px 0 32px'
                }}
              >
                {story.tags
                  .split(',')
                  .map((t) => (
                    <Link
                      key={t}
                      to={`/search?q=${encodeURIComponent(
                        t.trim()
                      )}`}
                      style={{
                        background:
                          '#f0ece0',
                        padding:
                          '5px 14px',
                        fontFamily:
                          "'Barlow Condensed', sans-serif",
                        fontSize: 11,
                        fontWeight: 700,
                        border:
                          '1px solid #e8e4d8',
                        textDecoration:
                          'none',
                        color: '#444',
                        borderRadius: 50
                      }}
                    >
                      #
                      {t.trim()}
                    </Link>
                  ))}
              </div>
            )}

            {/* INLINE AD 3 */}
            {inlineAds[2] && (
              <div
                style={{
                  marginBottom: 32
                }}
              >
                <AdCard
                  ad={inlineAds[2]}
                  height={90}
                />
              </div>
            )}

            {/* =================================================
                REACTIONS + SOCIAL SHARE
            ================================================= */}
            <div
              style={{
                display: 'flex',
                gap: 6,
                padding: '14px 0',
                borderTop:
                  '1px solid #e8e4d8',
                borderBottom:
                  '1px solid #e8e4d8',
                marginBottom: 24,
                flexWrap: 'wrap',
                alignItems:
                  'center'
              }}
            >

              {/* 8 REACTIONS */}
              {reactionButtons.map(
                (r) => (
                  <button
                    key={r.type}
                    type="button"
                    className={`mhk-react-btn ${
                      userReaction ===
                      r.type
                        ? 'active'
                        : ''
                    }`}
                    onClick={() =>
                      handleReact(
                        r.type
                      )
                    }
                    title={r.type}
                    aria-label={
                      r.type
                    }
                  >
                    <span
                      style={{
                        fontSize: 14,
                        lineHeight: 1
                      }}
                    >
                      {r.emoji}
                    </span>

                    <span>
                      {Number(
                        reactions[
                          r.type
                        ] || 0
                      ).toLocaleString()}
                    </span>
                  </button>
                )
              )}

              <div
                style={{
                  flex: 1
                }}
              />

              {/* NATIVE SHARE */}
              <button
                type="button"
                className="mhk-share-btn"
                onClick={
                  handleNativeShare
                }
                title="Share this story"
                aria-label="Share this story"
                style={{
                  padding:
                    '7px 12px',
                  background:
                    '#0d0d0d',
                  color: '#fff',
                  border: 'none',
                  fontFamily:
                    "'Barlow Condensed',sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: 'pointer',
                  letterSpacing: 1,
                  borderRadius: 3
                }}
              >
                📤 Share
              </button>

              {/* COPY LINK */}
              <button
                type="button"
                className="mhk-share-btn"
                onClick={
                  handleCopyLink
                }
                title="Copy story link"
                aria-label="Copy story link"
                style={{
                  padding:
                    '7px 12px',
                  background:
                    '#555',
                  color: '#fff',
                  border: 'none',
                  fontFamily:
                    "'Barlow Condensed',sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: 'pointer',
                  letterSpacing: 1,
                  borderRadius: 3
                }}
              >
                🔗 Copy Link
              </button>

              {/* FACEBOOK */}
              <button
                type="button"
                className="mhk-share-btn"
                onClick={
                  shareToFacebook
                }
                title="Share on Facebook"
                style={{
                  padding:
                    '7px 12px',
                  background:
                    '#1877f2',
                  color: '#fff',
                  border: 'none',
                  fontFamily:
                    "'Barlow Condensed',sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: 'pointer',
                  letterSpacing: 1,
                  borderRadius: 3
                }}
              >
                Facebook
              </button>

              {/* X */}
              <button
                type="button"
                className="mhk-share-btn"
                onClick={shareToX}
                title="Share on X"
                style={{
                  padding:
                    '7px 12px',
                  background: '#000',
                  color: '#fff',
                  border: 'none',
                  fontFamily:
                    "'Barlow Condensed',sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: 'pointer',
                  letterSpacing: 1,
                  borderRadius: 3
                }}
              >
                𝕏
              </button>

              {/* WHATSAPP */}
              <button
                type="button"
                className="mhk-share-btn"
                onClick={
                  shareToWhatsApp
                }
                title="Share on WhatsApp"
                style={{
                  padding:
                    '7px 12px',
                  background:
                    '#25d366',
                  color: '#fff',
                  border: 'none',
                  fontFamily:
                    "'Barlow Condensed',sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: 'pointer',
                  letterSpacing: 1,
                  borderRadius: 3
                }}
              >
                WhatsApp
              </button>

              {/* TELEGRAM */}
              <button
                type="button"
                className="mhk-share-btn"
                onClick={
                  shareToTelegram
                }
                title="Share on Telegram"
                style={{
                  padding:
                    '7px 12px',
                  background:
                    '#229ed9',
                  color: '#fff',
                  border: 'none',
                  fontFamily:
                    "'Barlow Condensed',sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: 'pointer',
                  letterSpacing: 1,
                  borderRadius: 3
                }}
              >
                Telegram
              </button>

              {/* LINKEDIN */}
              <button
                type="button"
                className="mhk-share-btn"
                onClick={
                  shareToLinkedIn
                }
                title="Share on LinkedIn"
                style={{
                  padding:
                    '7px 12px',
                  background:
                    '#0a66c2',
                  color: '#fff',
                  border: 'none',
                  fontFamily:
                    "'Barlow Condensed',sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: 'pointer',
                  letterSpacing: 1,
                  borderRadius: 3
                }}
              >
                LinkedIn
              </button>

              {/* EMAIL */}
              <button
                type="button"
                className="mhk-share-btn"
                onClick={
                  shareByEmail
                }
                title="Share by Email"
                style={{
                  padding:
                    '7px 12px',
                  background:
                    '#7c3aed',
                  color: '#fff',
                  border: 'none',
                  fontFamily:
                    "'Barlow Condensed',sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: 'pointer',
                  letterSpacing: 1,
                  borderRadius: 3
                }}
              >
                ✉ Email
              </button>

              {/* SMS */}
              <button
                type="button"
                className="mhk-share-btn"
                onClick={
                  shareBySMS
                }
                title="Share by SMS"
                style={{
                  padding:
                    '7px 12px',
                  background:
                    '#16a34a',
                  color: '#fff',
                  border: 'none',
                  fontFamily:
                    "'Barlow Condensed',sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  cursor: 'pointer',
                  letterSpacing: 1,
                  borderRadius: 3
                }}
              >
                💬 SMS
              </button>
            </div>

            {/* SHARE MESSAGE */}
            {commentMsg &&
              (commentMsg.includes(
                'copied'
              ) ||
                commentMsg.includes(
                  'Failed to copy'
                )) && (
                <div
                  style={{
                    marginTop: -14,
                    marginBottom: 20,
                    padding:
                      '7px 10px',
                    background:
                      'rgba(22,101,52,.08)',
                    color: '#166534',
                    fontFamily:
                      "'Barlow Condensed',sans-serif",
                    fontSize: 12,
                    borderRadius: 4
                  }}
                >
                  {commentMsg}
                </div>
              )}

            {/* AUTHOR BOX */}
            <div
              style={{
                display: 'flex',
                gap: 20,
                padding: 24,
                background:
                  'linear-gradient(135deg, #f5f3ec 0%, #eee9dc 100%)',
                borderRadius: 12,
                border:
                  '1px solid #e8e4d8',
                marginBottom: 40
              }}
            >
              {authorAvatar && (
                <img
                  src={imgUrl(
                    authorAvatar
                  )}
                  alt=""
                  onError={(e) => {
                    e.target.onerror =
                      null;
                    e.target.src =
                      PLACEHOLDER;
                  }}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius:
                      '50%',
                    objectFit:
                      'cover',
                    border:
                      '3px solid #fff',
                    boxShadow:
                      '0 4px 10px rgba(0,0,0,.1)',
                    flexShrink: 0
                  }}
                />
              )}

              <div>
                <div
                  style={{
                    fontFamily:
                      "'Barlow Condensed', sans-serif",
                    fontSize: 9,
                    letterSpacing: 2.5,
                    textTransform:
                      'uppercase',
                    color:
                      '#c0392b',
                    fontWeight: 800,
                    marginBottom: 4
                  }}
                >
                  Written By
                </div>

                <Link
                  to={`/author/${encodeURIComponent(
                    story.author
                  )}`}
                  style={{
                    fontFamily:
                      "'Playfair Display', serif",
                    fontSize:
                      '1.2rem',
                    fontWeight: 700,
                    textDecoration:
                      'none',
                    color:
                      '#0d0d0d'
                  }}
                >
                  {story.author}
                </Link>

                <p
                  style={{
                    fontSize: 13,
                    color: '#555',
                    fontStyle:
                      'italic',
                    marginTop: 6,
                    lineHeight: 1.6,
                    margin:
                      '6px 0 0'
                  }}
                >
                  {story.author_bio_full ||
                    story.author_bio ||
                    "Staff writer at Mahoko Friday News, covering the stories that matter most to Rwanda's youth."}
                </p>
              </div>
            </div>

            {/* RELATED STORIES */}
            {related.length > 0 && (
              <section
                style={{
                  marginBottom: 40
                }}
              >
                <SectionLabel>
                  Related Stories
                </SectionLabel>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 20
                  }}
                >
                  {related.map((s) => (
                    <Link
                      key={
                        s._id || s.id
                      }
                      to={`/story/${
                        s._id || s.id
                      }`}
                      className="mhk-related-card"
                      style={{
                        textDecoration:
                          'none',
                        color:
                          'inherit'
                      }}
                    >
                      <div
                        style={{
                          overflow:
                            'hidden'
                        }}
                      >
                        <img
                          src={imgUrl(
                            s.image
                          )}
                          alt=""
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror =
                              null;
                            e.target.src =
                              PLACEHOLDER;
                          }}
                          style={{
                            width:
                              '100%',
                            aspectRatio:
                              '16/10',
                            height:
                              'auto',
                            objectFit:
                              'cover',
                            display:
                              'block'
                          }}
                        />
                      </div>

                      <div
                        style={{
                          padding:
                            '12px 14px'
                        }}
                      >
                        <div
                          style={{
                            fontFamily:
                              "'Barlow Condensed', sans-serif",
                            fontSize: 9,
                            color:
                              '#c0392b',
                            fontWeight:
                              800,
                            letterSpacing:
                              2,
                            marginBottom:
                              6
                          }}
                        >
                          {
                            s.category
                          }
                        </div>

                        <div
                          style={{
                            fontFamily:
                              "'Playfair Display', serif",
                            fontSize:
                              '.95rem',
                            fontWeight:
                              700,
                            lineHeight:
                              1.3
                          }}
                        >
                          {(
                            s.title ||
                            ''
                          ).substring(
                            0,
                            70
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* DISCUSSION CTA */}
            <section>
              <SectionLabel>
                Discussion (
                {comments.length})
              </SectionLabel>

              <div
                style={{
                  background:
                    '#faf9f5',
                  padding:
                    '40px 24px',
                  border:
                    '1px solid #e8e4d8',
                  borderRadius: 12,
                  textAlign:
                    'center'
                }}
              >
                <div
                  style={{
                    fontSize: 40,
                    marginBottom: 12
                  }}
                >
                  💬
                </div>

                <h3
                  style={{
                    fontFamily:
                      "'Playfair Display', serif",
                    fontSize:
                      '1.3rem',
                    fontWeight: 700,
                    marginBottom: 8
                  }}
                >
                  {comments.length}{' '}
                  {comments.length ===
                  1
                    ? 'Comment'
                    : 'Comments'}
                </h3>

                <p
                  style={{
                    color: '#666',
                    fontSize: 14,
                    marginBottom: 20,
                    fontStyle:
                      'italic'
                  }}
                >
                  {comments.length >
                  0
                    ? 'Join the conversation and share your thoughts.'
                    : 'Be the first to comment on this story.'}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowCommentModal(
                      true
                    )
                  }
                  style={{
                    background:
                      '#0d0d0d',
                    color: '#fff',
                    border: 'none',
                    padding:
                      '11px 26px',
                    fontFamily:
                      "'Barlow Condensed',sans-serif",
                    fontWeight: 800,
                    fontSize: 12,
                    letterSpacing: 2,
                    textTransform:
                      'uppercase',
                    cursor: 'pointer',
                    borderRadius: 3,
                    transition:
                      'all .2s'
                  }}
                  onMouseEnter={(
                    e
                  ) => {
                    e.currentTarget.style.background =
                      '#c0392b';
                    e.currentTarget.style.transform =
                      'translateY(-1px)';
                  }}
                  onMouseLeave={(
                    e
                  ) => {
                    e.currentTarget.style.background =
                      '#0d0d0d';
                    e.currentTarget.style.transform =
                      'translateY(0)';
                  }}
                >
                  {comments.length >
                  0
                    ? `💬 View Comments (${comments.length})`
                    : '💬 Add a Comment'}
                </button>
              </div>
            </section>
          </main>

          {/* RIGHT SIDEBAR */}
          <aside className="story-right-col">

            <div
              style={{
                background: '#fff',
                border:
                  '1px solid #e8e4d8',
                padding: 20,
                borderRadius: 8,
                borderTop:
                  '4px solid #0d0d0d'
              }}
            >
              <div
                style={{
                  fontFamily:
                    "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: 11,
                  letterSpacing: 2.5,
                  textTransform:
                    'uppercase',
                  borderBottom:
                    '2px solid #0d0d0d',
                  paddingBottom: 10,
                  marginBottom: 14
                }}
              >
                🔥 Most Read
              </div>

              {popular.map(
                (p, i) => (
                  <PopularItem
                    key={
                      p._id || p.id
                    }
                    story={p}
                    rank={i + 1}
                  />
                )
              )}
            </div>

            <NewsletterWidget />

            {rightAds.length > 0 && (
              <div>
                <div
                  style={{
                    fontFamily:
                      "'Barlow Condensed', sans-serif",
                    fontSize: 8,
                    fontWeight: 800,
                    letterSpacing: 2,
                    textTransform:
                      'uppercase',
                    color: '#bbb',
                    marginBottom: 8,
                    textAlign:
                      'center'
                  }}
                >
                  Sponsors
                </div>

                {rightAds.map(
                  (ad, i) => (
                    <AdCard
                      key={
                        ad._id ||
                        ad.id ||
                        i
                      }
                      ad={ad}
                      height={220}
                    />
                  )
                )}
              </div>
            )}

            <WhatsAppCTA />
          </aside>
        </div>

        {/* BOTTOM CAROUSEL */}
        {floatAds.length > 0 && (
          <div
            style={{
              marginTop: 48
            }}
          >
            <SectionLabel>
              Our Sponsors
            </SectionLabel>

            <div
              key={adIndex}
              className="mhk-float-fade"
              style={{
                minHeight: 180
              }}
            >
              <AdCard
                ad={
                  floatAds[
                    adIndex %
                      floatAds.length
                  ]
                }
                fluid
              />

              <AdCard
                ad={
                  floatAds[
                    (adIndex + 1) %
                      floatAds.length
                  ]
                }
                fluid
                className="mhk-float-extra"
              />

              <AdCard
                ad={
                  floatAds[
                    (adIndex + 2) %
                      floatAds.length
                  ]
                }
                fluid
                className="mhk-float-extra"
              />
            </div>
          </div>
        )}
      </div>

      {/* COMMENT MODAL */}
      {showCommentModal && (
        <div
          className="mhk-modal-bg"
          onClick={(e) => {
            if (
              e.target ===
              e.currentTarget
            ) {
              setShowCommentModal(
                false
              );
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background:
              'rgba(0,0,0,.6)',
            zIndex: 10000,
            display: 'flex',
            alignItems:
              'flex-start',
            justifyContent:
              'center',
            padding:
              '32px 16px',
            overflowY: 'auto',
            backdropFilter:
              'blur(3px)'
          }}
        >
          <div
            className="mhk-modal-card"
            style={{
              background: '#fff',
              width: '100%',
              maxWidth: 640,
              borderRadius: 12,
              boxShadow:
                '0 24px 64px rgba(0,0,0,.3)',
              overflow: 'hidden',
              marginTop: 24,
              marginBottom: 24
            }}
          >

            {/* MODAL HEADER */}
            <div
              style={{
                display: 'flex',
                alignItems:
                  'center',
                justifyContent:
                  'space-between',
                padding:
                  '16px 20px',
                borderBottom:
                  '2px solid #0d0d0d',
                background:
                  '#0d0d0d',
                color: '#fff',
                position:
                  'sticky',
                top: 0,
                zIndex: 2
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily:
                      "'Barlow Condensed', sans-serif",
                    fontSize: 9,
                    letterSpacing: 2,
                    textTransform:
                      'uppercase',
                    color:
                      '#e74c3c',
                    fontWeight: 800
                  }}
                >
                  Discussion
                </div>

                <h3
                  style={{
                    fontFamily:
                      "'Playfair Display', serif",
                    fontSize:
                      '1.2rem',
                    fontWeight: 700,
                    margin: 0,
                    display:
                      'flex',
                    alignItems:
                      'center',
                    gap: 10
                  }}
                >
                  Comments (
                  {
                    comments.length
                  })

                  {refreshingComments && (
                    <span
                      className="mhk-spin"
                      style={{
                        width: 12,
                        height: 12,
                        borderWidth: 2
                      }}
                    />
                  )}
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCommentModal(
                    false
                  )
                }
                style={{
                  width: 36,
                  height: 36,
                  borderRadius:
                    '50%',
                  background:
                    'rgba(255,255,255,.1)',
                  color: '#fff',
                  border: 'none',
                  cursor:
                    'pointer',
                  fontSize: 20,
                  display:
                    'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center'
                }}
                aria-label="Close comments"
              >
                ×
              </button>
            </div>

            {/* COMMENTS */}
            <div
              style={{
                maxHeight:
                  '50vh',
                overflowY:
                  'auto'
              }}
            >
              {comments.length >
              0 ? (
                <div
                  style={{
                    padding:
                      '12px 20px'
                  }}
                >
                  {comments.map(
                    (c) => (
                      <div
                        key={
                          c._id ||
                          c.id
                        }
                        className="mhk-comment-row"
                        style={{
                          padding:
                            '14px 0',
                          borderBottom:
                            '1px solid #f0ece0'
                        }}
                      >
                        <div
                          style={{
                            display:
                              'flex',
                            alignItems:
                              'center',
                            gap: 12,
                            marginBottom:
                              8
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              background:
                                '#f0ece0',
                              borderRadius:
                                '50%',
                              display:
                                'flex',
                              alignItems:
                                'center',
                              justifyContent:
                                'center',
                              fontFamily:
                                "'Playfair Display', serif",
                              fontWeight:
                                700,
                              fontSize: 15,
                              color:
                                '#c0392b',
                              flexShrink:
                                0
                            }}
                          >
                            {(
                              c.name ||
                              'A'
                            )
                              .charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>

                          <div>
                            <div
                              style={{
                                fontFamily:
                                  "'Barlow Condensed', sans-serif",
                                fontSize: 14,
                                fontWeight:
                                  700
                              }}
                            >
                              {
                                c.name
                              }
                            </div>

                            <div
                              style={{
                                fontFamily:
                                  "'Barlow Condensed', sans-serif",
                                fontSize: 10,
                                color:
                                  '#aaa'
                              }}
                            >
                              {timeAgo(
                                c.created_at ||
                                  c.createdAt
                              )}
                            </div>
                          </div>
                        </div>

                        <p
                          style={{
                            fontSize: 14,
                            lineHeight:
                              1.7,
                            paddingLeft:
                              48,
                            margin: 0,
                            color:
                              '#333'
                          }}
                        >
                          {
                            c.comment
                          }
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div
                  style={{
                    padding:
                      '40px 20px',
                    textAlign:
                      'center'
                  }}
                >
                  <div
                    style={{
                      fontSize: 32,
                      marginBottom: 10
                    }}
                  >
                    💬
                  </div>

                  <p
                    style={{
                      color: '#666',
                      fontStyle:
                        'italic',
                      fontSize: 14
                    }}
                  >
                    Be the first
                    to comment on
                    this story.
                  </p>
                </div>
              )}
            </div>

            {/* COMMENT FORM */}
            <div
              style={{
                background:
                  '#f5f3ec',
                padding: 20,
                borderTop:
                  '2px solid #e8e4d8'
              }}
            >
              <h4
                style={{
                  fontFamily:
                    "'Playfair Display', serif",
                  fontSize:
                    '1.1rem',
                  fontWeight: 700,
                  marginBottom: 16
                }}
              >
                Leave a Comment
              </h4>

              <form
                onSubmit={
                  handleComment
                }
                style={{
                  display:
                    'flex',
                  flexDirection:
                    'column',
                  gap: 12
                }}
              >
                <div className="mhk-comment-form-grid">

                  <div>
                    <label
                      style={{
                        display:
                          'block',
                        fontFamily:
                          "'Barlow Condensed', sans-serif",
                        fontSize: 10,
                        fontWeight:
                          800,
                        letterSpacing:
                          2,
                        textTransform:
                          'uppercase',
                        marginBottom:
                          6,
                        color:
                          '#666'
                      }}
                    >
                      Name
                    </label>

                    <input
                      value={
                        form.name
                      }
                      onChange={(
                        e
                      ) =>
                        setForm(
                          (f) => ({
                            ...f,
                            name: e
                              .target
                              .value
                          })
                        )
                      }
                      placeholder="Your name…"
                      style={{
                        width:
                          '100%',
                        padding:
                          '10px 14px',
                        border:
                          '1px solid #e8e4d8',
                        background:
                          '#fff',
                        fontSize: 14,
                        borderRadius:
                          8,
                        outline:
                          'none',
                        boxSizing:
                          'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display:
                          'block',
                        fontFamily:
                          "'Barlow Condensed', sans-serif",
                        fontSize: 10,
                        fontWeight:
                          800,
                        letterSpacing:
                          2,
                        textTransform:
                          'uppercase',
                        marginBottom:
                          6,
                        color:
                          '#666'
                      }}
                    >
                      Email (optional)
                    </label>

                    <input
                      type="email"
                      value={
                        form.email
                      }
                      onChange={(
                        e
                      ) =>
                        setForm(
                          (f) => ({
                            ...f,
                            email: e
                              .target
                              .value
                          })
                        )
                      }
                      placeholder="your@email.com"
                      style={{
                        width:
                          '100%',
                        padding:
                          '10px 14px',
                        border:
                          '1px solid #e8e4d8',
                        background:
                          '#fff',
                        fontSize: 14,
                        borderRadius:
                          8,
                        outline:
                          'none',
                        boxSizing:
                          'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display:
                        'block',
                      fontFamily:
                        "'Barlow Condensed', sans-serif",
                      fontSize: 10,
                      fontWeight:
                        800,
                      letterSpacing:
                        2,
                      textTransform:
                        'uppercase',
                      marginBottom:
                        6,
                      color:
                        '#666'
                    }}
                  >
                    Comment *
                  </label>

                  <textarea
                    value={
                      form.comment
                    }
                    onChange={(
                      e
                    ) =>
                      setForm(
                        (f) => ({
                          ...f,
                          comment:
                            e.target
                              .value
                        })
                      )
                    }
                    rows={4}
                    required
                    placeholder="Share your thoughts…"
                    style={{
                      width:
                        '100%',
                      padding:
                        '10px 14px',
                      border:
                        '1px solid #e8e4d8',
                      background:
                        '#fff',
                      fontSize: 14,
                      borderRadius:
                        8,
                      outline:
                        'none',
                      resize:
                        'vertical',
                      boxSizing:
                        'border-box'
                    }}
                  />
                </div>

                <div
                  style={{
                    display:
                      'flex',
                    gap: 12,
                    alignItems:
                      'center',
                    flexWrap:
                      'wrap'
                  }}
                >
                  <button
                    type="submit"
                    disabled={
                      submitting
                    }
                    style={{
                      background:
                        submitting
                          ? '#999'
                          : '#0d0d0d',
                      color: '#fff',
                      border: 'none',
                      padding:
                        '11px 22px',
                      fontFamily:
                        "'Barlow Condensed',sans-serif",
                      fontWeight: 800,
                      fontSize: 11,
                      letterSpacing:
                        2,
                      textTransform:
                        'uppercase',
                      cursor:
                        submitting
                          ? 'not-allowed'
                          : 'pointer',
                      opacity:
                        submitting
                          ? 0.7
                          : 1,
                      borderRadius: 3,
                      display:
                        'flex',
                      alignItems:
                        'center',
                      gap: 8,
                      transition:
                        'background .2s'
                    }}
                    onMouseEnter={(
                      e
                    ) => {
                      if (
                        !submitting
                      ) {
                        e.currentTarget.style.background =
                          '#c0392b';
                      }
                    }}
                    onMouseLeave={(
                      e
                    ) => {
                      if (
                        !submitting
                      ) {
                        e.currentTarget.style.background =
                          '#0d0d0d';
                      }
                    }}
                  >
                    {submitting ? (
                      <>
                        <span className="mhk-spin" />
                        Submitting…
                      </>
                    ) : (
                      'Post Comment'
                    )}
                  </button>

                  {commentMsg &&
                    !commentMsg.includes(
                      'copied'
                    ) &&
                    !commentMsg.includes(
                      'Failed to copy'
                    ) && (
                      <p
                        style={{
                          color:
                            commentMsg.startsWith(
                              '✅'
                            )
                              ? '#166534'
                              : '#c0392b',
                          fontSize: 12,
                          margin: 0,
                          padding:
                            '4px 10px',
                          borderRadius: 3,
                          background:
                            commentMsg.startsWith(
                              '✅'
                            )
                              ? 'rgba(22,101,52,.08)'
                              : 'rgba(192,57,43,.08)'
                        }}
                      >
                        {
                          commentMsg
                        }
                      </p>
                    )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}

