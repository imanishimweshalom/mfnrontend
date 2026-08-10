import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';

import {
  PopularItem,
  AdBanner,
  SectionLabel,
  NewsletterWidget,
  WhatsAppCTA,
  Spinner,
  EmptyState,
  imgUrl,
  timeAgo
} from '../../components/ui';

import {
  storiesAPI,
  commentsAPI,
  adsAPI
} from '../../utils/api';

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='16' height='16' fill='%23e8e4d8'/%3E%3C/svg%3E";

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
  const [refreshingComments, setRefreshingComments] = useState(false);

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

  const [userReaction, setUserReaction] = useState(null);

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const [adIndex, setAdIndex] = useState(0);

  // =========================================================
  // LOAD STORY + COMMENTS + POPULAR + ADS
  // =========================================================
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
          storiesAPI.getPopular({ limit: 5 }),
          adsAPI.getAll()
        ]);

        const s = sRes.data;

        setStory(s);

        setReactions({
          likes: Number(s.likes || 0),
          dislikes: Number(s.dislikes || 0),
          love: Number(s.love || s.loves || 0),
          laugh: Number(s.laugh || s.laughs || 0),
          wow: Number(s.wow || 0),
          sad: Number(s.sad || 0),
          angry: Number(s.angry || 0),
          celebrate: Number(s.celebrate || 0)
        });

        // =====================================================
        // ONLY ADMIN APPROVED COMMENTS
        // =====================================================
        const allComments = Array.isArray(cRes.data)
          ? cRes.data
          : (
              cRes.data?.comments ||
              cRes.data?.data ||
              []
            );

        const approvedComments = allComments.filter(
          (comment) => {
            const status = String(
              comment.status ||
              comment.approval_status ||
              comment.comment_status ||
              ''
            ).toLowerCase();

            return (
              status === 'approved' ||
              comment.is_approved === true ||
              comment.approved === true ||
              comment.approved_by_admin === true
            );
          }
        );

        setComments(approvedComments);

        // =====================================================
        // POPULAR STORIES
        // =====================================================
        setPopular(
          Array.isArray(pRes.data)
            ? pRes.data
            : (
                pRes.data?.stories ||
                pRes.data?.data ||
                []
              )
        );

        // =====================================================
        // ADS
        // =====================================================
        const adsData = aRes.data;

        const adsArray = Array.isArray(adsData)
          ? adsData
          : (
              adsData?.ads ||
              adsData?.data ||
              adsData?.items ||
              []
            );

        setAds(adsArray);

        // =====================================================
        // RELATED STORIES
        // =====================================================
        const relRes = await storiesAPI.getAll({
          category: s.category,
          limit: 5,
          status: 'published'
        });

        const relatedStories = Array.isArray(relRes.data)
          ? relRes.data
          : (
              relRes.data?.stories ||
              relRes.data?.data ||
              []
            );

        setRelated(
          relatedStories
            .filter(
              (r) =>
                String(r._id || r.id) !== String(id)
            )
            .slice(0, 4)
        );
      } catch (error) {
        console.error(
          'Error loading story:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // =========================================================
  // ACTIVE ADS
  // =========================================================
  const activeAds = useMemo(() => {
    return (ads || []).filter((ad) => {
      return (
        ad &&
        ad.is_active !== false &&
        ad.status !== 'inactive' &&
        ad.status !== 'paused' &&
        ad.status !== 'draft'
      );
    });
  }, [ads]);

  const leftAds = useMemo(() => {
    return activeAds.slice(0, 3);
  }, [activeAds]);

  const floatAds = useMemo(() => {
    return activeAds.slice(0, 3);
  }, [activeAds]);

  // =========================================================
  // FLOATING ADS ROTATION
  // =========================================================
  useEffect(() => {
    if (floatAds.length === 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setAdIndex((previous) => {
        return (
          (previous + 1) %
          floatAds.length
        );
      });
    }, 8000);

    return () => {
      clearInterval(timer);
    };
  }, [floatAds]);

  // =========================================================
  // BODY SCROLL WHEN MODAL IS OPEN
  // =========================================================
  useEffect(() => {
    document.body.style.overflow =
      showCommentModal ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [showCommentModal]);

  // =========================================================
  // ESCAPE KEY
  // =========================================================
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setShowCommentModal(false);
        setShowShareMenu(false);
      }
    };

    if (
      showCommentModal ||
      showShareMenu
    ) {
      window.addEventListener(
        'keydown',
        onKey
      );
    }

    return () => {
      window.removeEventListener(
        'keydown',
        onKey
      );
    };
  }, [
    showCommentModal,
    showShareMenu
  ]);

  // =========================================================
  // REACTIONS
  // =========================================================
  const handleReact = async (type) => {
    try {
      const response =
        await storiesAPI.react(
          id,
          type
        );

      if (response?.data) {
        setReactions((previous) => ({
          ...previous,
          ...response.data
        }));
      }

      setUserReaction(type);
    } catch (error) {
      console.error(
        'Reaction error:',
        error
      );
    }
  };

  // =========================================================
  // REFRESH APPROVED COMMENTS
  // =========================================================
  const refreshApprovedComments =
    async () => {
      setRefreshingComments(true);

      try {
        const response =
          await commentsAPI.getByStory(id);

        const allComments =
          Array.isArray(response.data)
            ? response.data
            : (
                response.data?.comments ||
                response.data?.data ||
                []
              );

        const approvedComments =
          allComments.filter(
            (comment) => {
              const status = String(
                comment.status ||
                comment.approval_status ||
                comment.comment_status ||
                ''
              ).toLowerCase();

              return (
                status === 'approved' ||
                comment.is_approved === true ||
                comment.approved === true ||
                comment.approved_by_admin === true
              );
            }
          );

        setComments(
          approvedComments
        );
      } catch (error) {
        console.error(
          'Error refreshing comments:',
          error
        );
      } finally {
        setRefreshingComments(false);
      }
    };

  // =========================================================
  // COMMENT SUBMISSION
  // =========================================================
  const handleComment = async (event) => {
    event.preventDefault();

    if (!form.comment.trim()) {
      return;
    }

    setSubmitting(true);
    setCommentMsg('');

    try {
      await commentsAPI.create({
        story_id: id,
        ...form
      });

      setCommentMsg(
        '✅ Comment submitted. It will appear after admin approval.'
      );

      setForm({
        name: '',
        email: '',
        comment: ''
      });

      await refreshApprovedComments();

      setTimeout(() => {
        setCommentMsg('');
      }, 5000);
    } catch (error) {
      console.error(
        'Comment submission error:',
        error
      );

      setCommentMsg(
        '❌ Error submitting comment. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // SHARE DATA
  // =========================================================
  const currentUrl =
    window.location.href;

  const shareTitle =
    story?.title ||
    'Mahoko Friday News';

  const encodedUrl =
    encodeURIComponent(currentUrl);

  const encodedTitle =
    encodeURIComponent(shareTitle);

  // =========================================================
  // NATIVE SHARE
  // =========================================================
  const handleNativeShare =
    async () => {
      try {
        if (
          navigator.share
        ) {
          await navigator.share({
            title: shareTitle,
            text: shareTitle,
            url: currentUrl
          });

          setShowShareMenu(false);
          return;
        }

        await navigator.clipboard.writeText(
          currentUrl
        );

        setCommentMsg(
          '🔗 Story link copied!'
        );

        setTimeout(() => {
          setCommentMsg('');
        }, 3000);
      } catch (error) {
        console.log(
          'Share cancelled:',
          error
        );
      }
    };

  // =========================================================
  // COPY LINK
  // =========================================================
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        currentUrl
      );

      setShowShareMenu(false);

      setCommentMsg(
        '🔗 Story link copied successfully!'
      );

      setTimeout(() => {
        setCommentMsg('');
      }, 3000);
    } catch (error) {
      console.error(
        'Copy link error:',
        error
      );
    }
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <PublicLayout>
        <div
          style={{
            minHeight: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Spinner />
        </div>
      </PublicLayout>
    );
  }

  // =========================================================
  // STORY NOT FOUND
  // =========================================================
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

  // =========================================================
  // REACTION BUTTONS
  // =========================================================
  const reactionButtons = [
    {
      type: 'likes',
      emoji: '👍',
      label: 'Like'
    },
    {
      type: 'love',
      emoji: '❤️',
      label: 'Love'
    },
    {
      type: 'laugh',
      emoji: '😂',
      label: 'Haha'
    },
    {
      type: 'wow',
      emoji: '😮',
      label: 'Wow'
    },
    {
      type: 'sad',
      emoji: '😢',
      label: 'Sad'
    },
    {
      type: 'angry',
      emoji: '😡',
      label: 'Angry'
    },
    {
      type: 'celebrate',
      emoji: '👏',
      label: 'Celebrate'
    }
  ];

  // =========================================================
  // AD CARD COMPONENT
  // =========================================================
  const AdCard = ({ ad, height, fluid, className }) => {
    if (!ad) return null;

    const adImage = ad.image || ad.banner_image || ad.ad_image;
    const adLink = ad.link || ad.url || ad.ad_url || '#';
    const adTitle = ad.title || ad.ad_title || 'Advertisement';

    return (
      <a
        href={adLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`mhk-ad-card ${className || ''}`}
        style={{
          height: fluid ? '100%' : (height || 200),
          minHeight: fluid ? 160 : undefined,
          textDecoration: 'none',
          color: 'inherit',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {adImage && (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <img
              src={imgUrl(adImage)}
              alt={adTitle}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = PLACEHOLDER;
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
          </div>
        )}
        <div
          style={{
            padding: '8px 10px',
            background: '#f0ece0',
            borderTop: '1px solid #e8e4d8'
          }}
        >
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: '#999'
            }}
          >
            Sponsored
          </div>
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              color: '#0d0d0d',
              marginTop: 2
            }}
          >
            {adTitle}
          </div>
        </div>
      </a>
    );
  };

  return (
    <PublicLayout>

      <style>{`
        @keyframes mhkFade {
          from { opacity: 0; }
          to { opacity: 1; }
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
          to { transform: rotate(360deg); }
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

        .mhk-react-btn {
          transition: all .2s ease;
        }

        .mhk-react-btn:hover {
          background: #e8e4d8 !important;
          transform: translateY(-1px);
        }

        .mhk-react-btn.active {
          background: #e8e4d8 !important;
          border-color: #c0392b !important;
          transform: translateY(-1px);
        }

        .mhk-share-btn {
          transition: all .2s ease;
        }

        .mhk-share-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(0,0,0,.18);
        }

        .mhk-related-card {
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .mhk-related-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 24px rgba(0,0,0,.09);
        }

        .mhk-related-card .mhk-related-img {
          transition: transform .4s ease;
        }

        .mhk-related-card:hover .mhk-related-img {
          transform: scale(1.06);
        }

        .mhk-comment-row {
          transition: background .2s;
        }

        .mhk-comment-row:hover {
          background: rgba(240,236,224,.45);
        }

        .mhk-story-img {
          transition: transform .4s ease;
        }

        .mhk-story-img:hover {
          transform: scale(1.015);
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
          box-shadow: 0 8px 18px rgba(0,0,0,.12);
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

        .mhk-layout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .mhk-left-col,
        .mhk-right-col {
          width: 100%;
        }

        .mhk-left-col {
          display: none;
        }

        .mhk-comment-form-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 11px;
        }

        .mhk-modal-wrap {
          padding: 12px !important;
        }

        .mhk-share-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          width: 220px;
          background: #fff;
          border: 1px solid #e8e4d8;
          border-radius: 6px;
          box-shadow: 0 12px 30px rgba(0,0,0,.18);
          z-index: 1000;
          padding: 8px;
        }

        .mhk-share-option {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border: none;
          background: transparent;
          cursor: pointer;
          text-decoration: none;
          color: #0d0d0d;
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 12px;
          font-weight: 700;
          text-align: left;
          border-radius: 4px;
          box-sizing: border-box;
        }

        .mhk-share-option:hover {
          background: #f0ece0;
        }

        @media (min-width: 768px) {
          .mhk-layout-grid {
            grid-template-columns: 1fr 240px;
            gap: 24px;
          }

          .mhk-right-col {
            width: 240px;
            position: sticky;
            top: 72px;
            align-self: start;
            max-height: calc(100vh - 90px);
            overflow-y: auto;
          }

          .mhk-left-col {
            display: none;
          }

          .mhk-comment-form-grid {
            grid-template-columns: 1fr 1fr;
          }

          .mhk-float-extra {
            display: flex;
          }
        }

        @media (min-width: 1024px) {
          .mhk-layout-grid {
            grid-template-columns: 220px 1fr 280px;
            gap: 32px;
          }

          .mhk-left-col {
            display: flex;
            flex-direction: column;
            gap: 12px;
            position: sticky;
            top: 72px;
            align-self: start;
            max-height: calc(100vh - 90px);
            overflow-y: auto;
            padding-right: 4px;
          }

          .mhk-right-col {
            width: 280px;
          }

          .mhk-left-col::-webkit-scrollbar,
          .mhk-right-col::-webkit-scrollbar {
            width: 4px;
          }

          .mhk-left-col::-webkit-scrollbar-thumb,
          .mhk-right-col::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 2px;
          }
        }

        @media (max-width: 600px) {
          .mhk-share-menu {
            position: fixed;
            left: 12px;
            right: 12px;
            bottom: 12px;
            top: auto;
            width: auto;
          }

          .mhk-float-fade {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="mhk-layout-grid">

        {/* =====================================================
            LEFT ADVERTISEMENT SIDEBAR
        ====================================================== */}
        {leftAds.length > 0 && (
          <aside className="mhk-left-col">
            {leftAds.map((ad, index) => (
              <AdCard
                key={ad._id || ad.id || index}
                ad={ad}
                height={220}
              />
            ))}
          </aside>
        )}

        {/* =====================================================
            ARTICLE
        ====================================================== */}
        <article className="mhk-center-col">

          {/* Breadcrumb */}
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 10,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: '#bbb',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              marginBottom: 12,
              flexWrap: 'wrap'
            }}
          >
            <Link
              to="/"
              style={{
                color: '#bbb',
                textDecoration: 'none'
              }}
            >
              Home
            </Link>

            <span>›</span>

            <Link
              to={`/category/${story.category}`}
              style={{
                color: '#c0392b',
                textDecoration: 'none'
              }}
            >
              {story.category}
            </Link>
          </div>

          {/* Category */}
          <div style={{ marginBottom: 10 }}>
            <Link
              to={`/category/${story.category}`}
              style={{
                background: '#c0392b',
                color: '#fff',
                padding: '3px 10px',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: 9,
                letterSpacing: 2,
                textTransform: 'uppercase',
                textDecoration: 'none',
                borderRadius: 2
              }}
            >
              {story.category}
            </Link>
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(1.45rem, 3.5vw, 2.4rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              margin: '12px 0 10px'
            }}
          >
            {story.title}
          </h1>

          {/* Author / Date / Views */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 11,
              color: '#5a5a5a',
              marginBottom: 18,
              flexWrap: 'wrap',
              alignItems: 'center',
              borderBottom: '1px solid #e8e4d8',
              paddingBottom: 12
            }}
          >
            {authorAvatar && (
              <img
                src={imgUrl(authorAvatar)}
                alt=""
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = PLACEHOLDER;
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #e8e4d8'
                }}
              />
            )}

            <Link
              to={`/author/${encodeURIComponent(
                story.author
              )}`}
              style={{
                fontWeight: 700,
                textDecoration: 'none',
                color: '#0d0d0d'
              }}
            >
              {story.author}
            </Link>

            <span style={{ color: '#ddd' }}>·</span>

            <span>
              {timeAgo(
                story.created_at ||
                story.createdAt
              )}
            </span>

            <span style={{ color: '#ddd' }}>·</span>

            <span>
              👁{' '}
              {Number(
                story.views || 0
              ).toLocaleString()}{' '}
              views
            </span>

            {story.tags &&
              story.tags
                .split(',')
                .slice(0, 3)
                .map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?q=${encodeURIComponent(
                      tag.trim()
                    )}`}
                    style={{
                      background: '#f0ece0',
                      padding: '2px 7px',
                      fontSize: 9,
                      letterSpacing: 1,
                      color: '#5a5a5a',
                      textDecoration: 'none',
                      border: '1px solid #e8e4d8',
                      borderRadius: 2
                    }}
                  >
                    #{tag.trim()}
                  </Link>
                ))}
          </div>

          {/* Story Image */}
          <img
            className="mhk-story-img"
            src={imgUrl(story.image)}
            alt={story.title}
            loading="eager"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = PLACEHOLDER;
            }}
            style={{
              width: '100%',
              maxWidth: 720,
              height: 'auto',
              maxHeight: 520,
              minHeight: 260,
              aspectRatio: '16/9',
              objectFit: 'cover',
              borderRadius: 6,
              marginBottom: 22,
              display: 'block',
              marginInline: 'auto'
            }}
          />

          {/* Story Description */}
          <div
            style={{
              fontSize: '1.02rem',
              lineHeight: 1.78,
              fontFamily: "'Source Serif 4', Georgia, serif",
              marginBottom: 22
            }}
            dangerouslySetInnerHTML={{
              __html: story.description
            }}
          />

          {/* Tags */}
          {story.tags && (
            <div
              style={{
                display: 'flex',
                gap: 7,
                flexWrap: 'wrap',
                marginBottom: 22
              }}
            >
              {story.tags
                .split(',')
                .map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?q=${encodeURIComponent(
                      tag.trim()
                    )}`}
                    style={{
                      background: '#f0ece0',
                      padding: '4px 10px',
                      fontFamily:
                        "'Barlow Condensed', sans-serif",
                      fontSize: 10,
                      fontWeight: 700,
                      border: '1px solid #e8e4d8',
                      textDecoration: 'none',
                      color: '#0d0d0d',
                      borderRadius: 2
                    }}
                  >
                    #{tag.trim()}
                  </Link>
                ))}
            </div>
          )}

          {/* =================================================
              REACTIONS + SHARE
          ================================================= */}
          <div
            style={{
              display: 'flex',
              gap: 7,
              padding: '14px 0',
              borderTop: '1px solid #e8e4d8',
              borderBottom: '1px solid #e8e4d8',
              marginBottom: 22,
              flexWrap: 'wrap',
              alignItems: 'center'
            }}
          >
            {reactionButtons.map(
              (reaction) => (
                <button
                  key={reaction.type}
                  type="button"
                  className={`mhk-react-btn ${
                    userReaction ===
                    reaction.type
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    handleReact(
                      reaction.type
                    )
                  }
                  title={reaction.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '7px 10px',
                    background: '#f0ece0',
                    border: '1px solid #e8e4d8',
                    fontFamily:
                      "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    borderRadius: 3
                  }}
                >
                  <span style={{ fontSize: 16 }}>
                    {reaction.emoji}
                  </span>

                  <span>
                    {Number(
                      reactions[
                        reaction.type
                      ] || 0
                    )}
                  </span>
                </button>
              )
            )}

            <div style={{ flex: 1 }} />

            {/* SHARE BUTTON */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="mhk-share-btn"
                onClick={() =>
                  setShowShareMenu(
                    (previous) =>
                      !previous
                  )
                }
                style={{
                  padding: '8px 14px',
                  background: '#0d0d0d',
                  color: '#fff',
                  border: 'none',
                  fontFamily:
                    "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  textDecoration: 'none',
                  letterSpacing: 1,
                  borderRadius: 3,
                  cursor: 'pointer'
                }}
              >
                🔗 Share
              </button>

              {showShareMenu && (
                <div className="mhk-share-menu">
                  <button
                    type="button"
                    className="mhk-share-option"
                    onClick={handleNativeShare}
                  >
                    📱 Share to other apps
                  </button>

                  <a
                    className="mhk-share-option"
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🔵 Facebook
                  </a>

                  <a
                    className="mhk-share-option"
                    href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ⚫ X / Twitter
                  </a>

                  <a
                    className="mhk-share-option"
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `${shareTitle} ${currentUrl}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🟢 WhatsApp
                  </a>

                  <a
                    className="mhk-share-option"
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🔷 LinkedIn
                  </a>

                  <a
                    className="mhk-share-option"
                    href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ✈️ Telegram
                  </a>

                  <a
                    className="mhk-share-option"
                    href={`mailto:?subject=${encodedTitle}&body=${encodeURIComponent(
                      `${shareTitle}\n\n${currentUrl}`
                    )}`}
                  >
                    ✉️ Email
                  </a>

                  <button
                    type="button"
                    className="mhk-share-option"
                    onClick={copyLink}
                  >
                    🔗 Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Comment success/error message */}
          {commentMsg && (
            <div
              style={{
                marginBottom: 18,
                padding: '10px 14px',
                background:
                  commentMsg.startsWith('❌')
                    ? 'rgba(192,57,43,.08)'
                    : 'rgba(22,101,52,.08)',
                color:
                  commentMsg.startsWith('❌')
                    ? '#c0392b'
                    : '#166534',
                borderRadius: 4,
                fontSize: 12
              }}
            >
              {commentMsg}
            </div>
          )}

          {/* Author Box */}
          <div
            style={{
              background: '#f0ece0',
              padding: '18px',
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
              marginBottom: 24,
              border: '1px solid #e8e4d8',
              borderRadius: 4
            }}
          >
            {authorAvatar && (
              <img
                src={imgUrl(authorAvatar)}
                alt=""
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = PLACEHOLDER;
                }}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '2px solid #e8e4d8'
                }}
              />
            )}

            <div>
              <div
                style={{
                  fontFamily:
                    "'Barlow Condensed', sans-serif",
                  fontSize: 9,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: '#c0392b',
                  marginBottom: 3
                }}
              >
                About the Author
              </div>

              <Link
                to={`/author/${encodeURIComponent(
                  story.author
                )}`}
                style={{
                  fontFamily:
                    "'Playfair Display', serif",
                  fontSize: '1rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  color: '#0d0d0d'
                }}
              >
                {story.author}
              </Link>

              <p
                style={{
                  fontSize: 12,
                  color: '#5a5a5a',
                  fontStyle: 'italic',
                  marginTop: 5,
                  lineHeight: 1.55
                }}
              >
                {story.author_bio_full ||
                  story.author_bio ||
                  "Staff writer at Mahoko Friday News, covering the stories that matter most to Rwanda's youth."}
              </p>
            </div>
          </div>

          {/* Inline Ads */}
          <AdBanner
            ads={ads.slice(0, 3)}
            height={90}
          />

          {/* Related Stories */}
          {related.length > 0 && (
            <section style={{ marginBottom: 28 }}>
              <SectionLabel>
                Related Stories
              </SectionLabel>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fill,minmax(160px,1fr))',
                  gap: 16
                }}
              >
                {related.map((relatedStory) => (
                  <Link
                    key={
                      relatedStory._id ||
                      relatedStory.id
                    }
                    to={`/story/${
                      relatedStory._id ||
                      relatedStory.id
                    }`}
                    className="mhk-related-card"
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'block',
                      borderRadius: 6
                    }}
                  >
                    <img
                      className="mhk-related-img"
                      src={imgUrl(
                        relatedStory.image
                      )}
                      alt=""
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src =
                          PLACEHOLDER;
                      }}
                      style={{
                        width: '100%',
                        aspectRatio: '16/10',
                        height: 'auto',
                        objectFit: 'cover',
                        marginBottom: 6,
                        borderRadius: 6,
                        display: 'block'
                      }}
                    />

                    <div
                      style={{
                        fontFamily:
                          "'Barlow Condensed', sans-serif",
                        fontSize: 9,
                        color: '#c0392b',
                        fontWeight: 800,
                        letterSpacing: 2,
                        marginBottom: 3
                      }}
                    >
                      {relatedStory.category}
                    </div>

                    <div
                      style={{
                        fontFamily:
                          "'Playfair Display', serif",
                        fontSize: '.82rem',
                        fontWeight: 700,
                        lineHeight: 1.3
                      }}
                    >
                      {(
                        relatedStory.title ||
                        ''
                      ).substring(0, 65)}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Discussion */}
          <section>
            <SectionLabel>
              Discussion ({comments.length})
            </SectionLabel>

            <div
              style={{
                background: '#f0ece0',
                padding: '26px 20px',
                border: '1px solid #e8e4d8',
                borderRadius: 6,
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  fontSize: 34,
                  marginBottom: 8
                }}
              >
                💬
              </div>

              <h3
                style={{
                  fontFamily:
                    "'Playfair Display', serif",
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  marginBottom: 6
                }}
              >
                {comments.length}{' '}
                {comments.length === 1
                  ? 'Comment'
                  : 'Comments'}
              </h3>

              <p
                style={{
                  color: '#5a5a5a',
                  fontSize: 12.5,
                  marginBottom: 16,
                  fontStyle: 'italic'
                }}
              >
                {comments.length > 0
                  ? 'Join the conversation and share your thoughts.'
                  : 'Be the first to comment on this story.'}
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowCommentModal(true)
                }
                style={{
                  background: '#0d0d0d',
                  color: '#fff',
                  border: 'none',
                  padding: '11px 26px',
                  fontFamily:
                    "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: 3
                }}
              >
                {comments.length > 0
                  ? `💬 View Comments (${comments.length})`
                  : '💬 Add a Comment'}
              </button>
            </div>
          </section>
        </article>

        {/* =====================================================
            RIGHT SIDEBAR
        ====================================================== */}
        <aside className="mhk-right-col">
          <div>
            {/* Most Read */}
            <div
              style={{
                background: '#fff',
                border: '1px solid #e8e4d8',
                padding: 16,
                marginBottom: 18,
                borderTop: '3px solid #0d0d0d',
                borderRadius: 2
              }}
            >
              <div
                style={{
                  fontFamily:
                    "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: 10,
                  letterSpacing: 2.5,
                  textTransform: 'uppercase',
                  borderBottom:
                    '3px solid #0d0d0d',
                  paddingBottom: 8,
                  marginBottom: 12
                }}
              >
                🔥 Most Read
              </div>

              {popular.map(
                (popularStory, index) => (
                  <PopularItem
                    key={
                      popularStory._id ||
                      popularStory.id
                    }
                    story={popularStory}
                    rank={index + 1}
                  />
                )
              )}
            </div>

            {/* Newsletter */}
            <NewsletterWidget />

            {/* Sidebar Ads */}
            <AdBanner
              ads={ads.slice(0, 3)}
              height={200}
            />

            {/* WhatsApp CTA */}
            <WhatsAppCTA />
          </div>
        </aside>
      </div>

      {/* =====================================================
          BOTTOM AD CAROUSEL
      ====================================================== */}
      {floatAds.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <SectionLabel>
            Our Sponsors
          </SectionLabel>

          <div
            key={adIndex}
            className="mhk-float-fade"
            style={{ minHeight: 180 }}
          >
            <AdCard
              ad={
                floatAds[
                  adIndex % floatAds.length
                ]
              }
              fluid
            />

            <AdCard
              ad={
                floatAds[
                  (adIndex + 1) % floatAds.length
                ]
              }
              fluid
              className="mhk-float-extra"
            />

            <AdCard
              ad={
                floatAds[
                  (adIndex + 2) % floatAds.length
                ]
              }
              fluid
              className="mhk-float-extra"
            />
          </div>
        </div>
      )}

      {/* =====================================================
          COMMENT MODAL
      ====================================================== */}
      {showCommentModal && (
        <div
          className="mhk-modal-bg"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCommentModal(false);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.55)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12
          }}
        >
          <div
            className="mhk-modal-card mhk-modal-wrap"
            style={{
              background: '#fff',
              borderRadius: 8,
              maxWidth: 560,
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              border: '1px solid #e8e4d8',
              boxShadow: '0 24px 60px rgba(0,0,0,.25)'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                borderBottom: '1px solid #e8e4d8'
              }}
            >
              <h3
                style={{
                  fontFamily:
                    "'Playfair Display', serif",
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  margin: 0
                }}
              >
                💬 Comments ({comments.length})
              </h3>

              <button
                type="button"
                onClick={() =>
                  setShowCommentModal(false)
                }
                style={{
                  background: 'transparent',
                  border: '1px solid #e8e4d8',
                  width: 32,
                  height: 32,
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0d0d0d'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '16px 18px' }}>

              {/* Refresh button */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: 12
                }}
              >
                <button
                  type="button"
                  onClick={refreshApprovedComments}
                  disabled={refreshingComments}
                  style={{
                    background: '#f0ece0',
                    border: '1px solid #e8e4d8',
                    padding: '5px 12px',
                    fontFamily:
                      "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    fontSize: 10,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    cursor: refreshingComments
                      ? 'not-allowed'
                      : 'pointer',
                    opacity: refreshingComments
                      ? 0.5
                      : 1,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {refreshingComments && (
                    <span className="mhk-spin" />
                  )}
                  {refreshingComments
                    ? 'Refreshing...'
                    : '↻ Refresh'}
                </button>
              </div>

              {/* Comments List */}
              {comments.length > 0 ? (
                <div
                  style={{
                    marginBottom: 20,
                    maxHeight: 300,
                    overflowY: 'auto',
                    border: '1px solid #e8e4d8',
                    borderRadius: 4
                  }}
                >
                  {comments.map(
                    (comment, index) => (
                      <div
                        key={
                          comment._id ||
                          comment.id ||
                          index
                        }
                        className="mhk-comment-row"
                        style={{
                          padding: '12px 14px',
                          borderBottom:
                            index < comments.length - 1
                              ? '1px solid #e8e4d8'
                              : 'none'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent:
                              'space-between',
                            alignItems:
                              'flex-start',
                            marginBottom: 4
                          }}
                        >
                          <div
                            style={{
                              fontFamily:
                                "'Barlow Condensed', sans-serif",
                              fontWeight: 700,
                              fontSize: 12,
                              color: '#0d0d0d'
                            }}
                          >
                            {comment.name ||
                              'Anonymous'}
                          </div>

                          <div
                            style={{
                              fontFamily:
                                "'Barlow Condensed', sans-serif",
                              fontSize: 9,
                              color: '#aaa',
                              letterSpacing: 1,
                              textTransform:
                                'uppercase'
                            }}
                          >
                            {timeAgo(
                              comment.created_at ||
                              comment.createdAt
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            fontSize: 13,
                            lineHeight: 1.6,
                            color: '#333'
                          }}
                        >
                          {comment.comment ||
                            comment.text ||
                            comment.body}
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '28px 16px',
                    marginBottom: 20,
                    background: '#f0ece0',
                    borderRadius: 4,
                    border: '1px solid #e8e4d8'
                  }}
                >
                  <div
                    style={{
                      fontSize: 28,
                      marginBottom: 6
                    }}
                  >
                    💭
                  </div>
                  <p
                    style={{
                      color: '#5a5a5a',
                      fontSize: 13,
                      margin: 0,
                      fontStyle: 'italic'
                    }}
                  >
                    No comments yet. Be the first
                    to share your thoughts!
                  </p>
                </div>
              )}

              {/* Comment Form */}
              <form onSubmit={handleComment}>
                <div
                  style={{
                    fontFamily:
                      "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: 10,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    color: '#0d0d0d',
                    marginBottom: 10
                  }}
                >
                  Add a Comment
                </div>

                <div className="mhk-comment-form-grid">
                  <input
                    type="text"
                    placeholder="Your name *"
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        name: e.target.value
                      }))
                    }
                    style={{
                      padding: '9px 12px',
                      border: '1px solid #e8e4d8',
                      borderRadius: 3,
                      fontFamily:
                        "'Barlow Condensed', sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      background: '#fafaf5',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />

                  <input
                    type="email"
                    placeholder="Your email *"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        email: e.target.value
                      }))
                    }
                    style={{
                      padding: '9px 12px',
                      border: '1px solid #e8e4d8',
                      borderRadius: 3,
                      fontFamily:
                        "'Barlow Condensed', sans-serif",
                      fontSize: 13,
                      fontWeight: 600,
                      background: '#fafaf5',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <textarea
                  placeholder="Write your comment..."
                  required
                  rows={4}
                  value={form.comment}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      comment: e.target.value
                    }))
                  }
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    border: '1px solid #e8e4d8',
                    borderRadius: 3,
                    fontFamily:
                      "'Source Serif 4', Georgia, serif",
                    fontSize: 13,
                    lineHeight: 1.6,
                    background: '#fafaf5',
                    outline: 'none',
                    resize: 'vertical',
                    marginTop: 11,
                    marginBottom: 12,
                    boxSizing: 'border-box'
                  }}
                />

                {commentMsg && (
                  <div
                    style={{
                      marginBottom: 10,
                      padding: '8px 12px',
                      background: commentMsg.startsWith(
                        '❌'
                      )
                        ? 'rgba(192,57,43,.08)'
                        : 'rgba(22,101,52,.08)',
                      color: commentMsg.startsWith(
                        '❌'
                      )
                        ? '#c0392b'
                        : '#166534',
                      borderRadius: 3,
                      fontSize: 12
                    }}
                  >
                    {commentMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: submitting
                      ? '#999'
                      : '#0d0d0d',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 24px',
                    fontFamily:
                      "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: 11,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    cursor: submitting
                      ? 'not-allowed'
                      : 'pointer',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  {submitting && (
                    <span className="mhk-spin" />
                  )}
                  {submitting
                    ? 'Submitting...'
                    : '📤 Submit Comment'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </PublicLayout>
  );
}
