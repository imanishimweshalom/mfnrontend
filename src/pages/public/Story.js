
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
          transition:
            transform .25s ease,
            box-shadow .25s ease;
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
          transition:
            transform .3s ease,
            box-shadow .3s ease;
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

            <span style={{ color: '#ddd' }}>
              ·
            </span>

            <span>
              {timeAgo(
                story.created_at ||
                story.createdAt
              )}
            </span>

            <span style={{ color: '#ddd' }}>
              ·
            </span>

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
                  <span
                    style={{
                      fontSize: 16
                    }}
                  >
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

            <div
              style={{
                flex: 1
              }}
            />

            {/* SHARE BUTTON */}
            <div
              style={{
                position: 'relative'
              }}
            >
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

                  {/* Native Share */}
                  <button
                    type="button"
                    className="mhk-share-option"
                    onClick={
                      handleNativeShare
                    }
                  >
                    📱 Share to other apps
                  </button>

                  {/* Facebook */}
                  <a
                    className="mhk-share-option"
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🔵 Facebook
                  </a>

                  {/* X */}
                  <a
                    className="mhk-share-option"
                    href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ⚫ X / Twitter
                  </a>

                  {/* WhatsApp */}
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

                  {/* LinkedIn */}
                  <a
                    className="mhk-share-option"
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🔷 LinkedIn
                  </a>

                  {/* Telegram */}
                  <a
                    className="mhk-share-option"
                    href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ✈️ Telegram
                  </a>

                  {/* Email */}
                  <a
                    className="mhk-share-option"
                    href={`mailto:?subject=${encodedTitle}&body=${encodeURIComponent(
                      `${shareTitle}\n\n${currentUrl}`
                    )}`}
                  >
                    ✉️ Email
                  </a>

                  {/* Copy Link */}
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
            <section
              style={{
                marginBottom: 28
              }}
            >
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
                  setShowCommentModal(
                    true
                  )
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
        <div
          style={{
            marginTop: 40
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

  // ---------------------------------------------------------
  // SHARE DATA
  // ---------------------------------------------------------
  const currentUrl = window.location.href;
  const shareTitle = story?.title || 'Mahoko Friday News';
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedTitle = encodeURIComponent(shareTitle);

  // ---------------------------------------------------------
  // NATIVE SHARE
  // ---------------------------------------------------------
  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareTitle,
          url: currentUrl
        });

        setShowShareMenu(false);
        return;
      }

      await navigator.clipboard.writeText(currentUrl);

      setCommentMsg('🔗 Story link copied!');

      setTimeout(() => {
        setCommentMsg('');
      }, 3000);
    } catch (e) {
      console.log('Share cancelled:', e);
    }
  };

  // ---------------------------------------------------------
  // COPY LINK
  // ---------------------------------------------------------
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);

      setShowShareMenu(false);
      setCommentMsg('🔗 Story link copied successfully!');

      setTimeout(() => {
        setCommentMsg('');
      }, 3000);
    } catch (e) {
      console.error('Copy link error:', e);
    }
  };

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // STORY NOT FOUND
  // ---------------------------------------------------------
  if (!story) {
    return (
      <PublicLayout>
        <EmptyState />
      </PublicLayout>
    );
  }

  const authorAvatar =
    story.author_avatar || story.author_image;

  // ---------------------------------------------------------
  // REACTION BUTTONS
  // ---------------------------------------------------------
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

  return (
    <PublicLayout>

      {/* =====================================================
          STORY PAGE STYLES
      ===================================================== */}
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
          transition:
            transform .25s ease,
            box-shadow .25s ease;
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
          transition:
            transform .3s ease,
            box-shadow .3s ease;

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

          box-shadow:
            0 12px 30px rgba(0,0,0,.18);

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

          font-family:
            'Barlow Condensed',
            sans-serif;

          font-size: 12px;

          font-weight: 700;

          text-align: left;

          border-radius: 4px;
        }

        .mhk-share-option:hover {
          background: #f0ece0;
        }

        /* ===================================================
           TABLET
        =================================================== */

        @media (min-width: 768px) {

          .mhk-layout-grid {
            grid-template-columns:
              1fr 240px;

            gap: 24px;
          }

          .mhk-right-col {
            width: 240px;

            position: sticky;

            top: 72px;

            align-self: start;

            max-height:
              calc(100vh - 90px);

            overflow-y: auto;
          }

          .mhk-left-col {
            display: none;
          }

          .mhk-comment-form-grid {
            grid-template-columns:
              1fr 1fr;
          }

          .mhk-float-extra {
            display: flex;
          }
        }

        /* ===================================================
           DESKTOP
        =================================================== */

        @media (min-width: 1024px) {

          .mhk-layout-grid {
            grid-template-columns:
              220px 1fr 280px;

            gap: 32px;
          }

          .mhk-left-col {
            display: flex;

            flex-direction: column;

            gap: 12px;

            position: sticky;

            top: 72px;

            align-self: start;

            max-height:
              calc(100vh - 90px);

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

        /* ===================================================
           MOBILE
        =================================================== */

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

      {/* =====================================================
          MAIN RESPONSIVE GRID
      ===================================================== */}

      <div className="mhk-layout-grid">

        {/* ===================================================
            LEFT ADVERTISEMENT SIDEBAR
        =================================================== */}

        {leftAds.length > 0 && (
          <aside className="mhk-left-col">

            {leftAds.map((ad, i) => (
              <AdCard
                key={
                  ad._id ||
                  ad.id ||
                  i
                }
                ad={ad}
                height={220}
              />
            ))}

          </aside>
        )}

        {/* ===================================================
            ARTICLE
        =================================================== */}

        <article className="mhk-center-col">

          {/* Breadcrumb */}

          <div
            style={{
              fontFamily:
                "'Barlow Condensed',sans-serif",

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

          <div
            style={{
              marginBottom: 10
            }}
          >

            <Link
              to={`/category/${story.category}`}
              style={{
                background: '#c0392b',

                color: '#fff',

                padding: '3px 10px',

                fontFamily:
                  "'Barlow Condensed',sans-serif",

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

          {/* =================================================
              TITLE
          ================================================= */}

          <h1
            style={{
              fontFamily:
                "'Playfair Display',Georgia,serif",

              fontSize:
                'clamp(1.45rem, 3.5vw, 2.4rem)',

              fontWeight: 900,

              lineHeight: 1.15,

              margin: '12px 0 10px'
            }}
          >
            {story.title}
          </h1>

          {/* =================================================
              AUTHOR / DATE / VIEWS
          ================================================= */}

          <div
            style={{
              display: 'flex',

              gap: 10,

              fontFamily:
                "'Barlow Condensed',sans-serif",

              fontSize: 11,

              color: '#5a5a5a',

              marginBottom: 18,

              flexWrap: 'wrap',

              alignItems: 'center',

              borderBottom:
                '1px solid #e8e4d8',

              paddingBottom: 12
            }}
          >

            {authorAvatar && (
              <img
                src={imgUrl(authorAvatar)}
                alt=""
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = PLACEHOLDER;
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border:
                    '2px solid #e8e4d8'
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

            <span style={{ color: '#ddd' }}>
              ·
            </span>

            <span>
              {timeAgo(
                story.created_at ||
                story.createdAt
              )}
            </span>

            <span style={{ color: '#ddd' }}>
              ·
            </span>

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
                .map((t) => (
                  <Link
                    key={t}
                    to={`/search?q=${encodeURIComponent(
                      t.trim()
                    )}`}
                    style={{
                      background: '#f0ece0',
                      padding: '2px 7px',
                      fontSize: 9,
                      letterSpacing: 1,
                      color: '#5a5a5a',
                      textDecoration: 'none',
                      border:
                        '1px solid #e8e4d8',
                      borderRadius: 2
                    }}
                  >
                    #{t.trim()}
                  </Link>
                ))}

          </div>

          {/* =================================================
              STORY IMAGE
          ================================================= */}

          <img
            className="mhk-story-img"
            src={imgUrl(story.image)}
            alt={story.title}
            loading="eager"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = PLACEHOLDER;
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

          {/* =================================================
              STORY DESCRIPTION
          ================================================= */}

          <div
            style={{
              fontSize: '1.02rem',

              lineHeight: 1.78,

              fontFamily:
                "'Source Serif 4',Georgia,serif",

              marginBottom: 22
            }}
            dangerouslySetInnerHTML={{
              __html: story.description
            }}
          />

          {/* =================================================
              TAGS
          ================================================= */}

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
                        '4px 10px',

                      fontFamily:
                        "'Barlow Condensed',sans-serif",

                      fontSize: 10,

                      fontWeight: 700,

                      border:
                        '1px solid #e8e4d8',

                      textDecoration:
                        'none',

                      color: '#0d0d0d',

                      borderRadius: 2
                    }}
                  >
                    #{t.trim()}
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

              borderTop:
                '1px solid #e8e4d8',

              borderBottom:
                '1px solid #e8e4d8',

              marginBottom: 22,

              flexWrap: 'wrap',

              alignItems: 'center'
            }}
          >

            {reactionButtons.map(
              (reaction) => (
                <button
                  key={reaction.type}
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

                    background:
                      '#f0ece0',

                    border:
                      '1px solid #e8e4d8',

                    fontFamily:
                      "'Barlow Condensed',sans-serif",

                    fontWeight: 700,

                    fontSize: 12,

                    cursor: 'pointer',

                    borderRadius: 3
                  }}
                >

                  <span
                    style={{
                      fontSize: 16
                    }}
                  >
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

            <div
              style={{
                flex: 1
              }}
            />

            {/* =================================================
                SHARE BUTTON
            ================================================= */}

            <div
              style={{
                position: 'relative'
              }}
            >

              <button
                className="mhk-share-btn"
                onClick={() =>
                  setShowShareMenu(
                    (prev) => !prev
                  )
                }
                style={{
                  padding: '8px 14px',

                  background:
                    '#0d0d0d',

                  color: '#fff',

                  border: 'none',

                  fontFamily:
                    "'Barlow Condensed',sans-serif",

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
                <div
                  className="mhk-share-menu"
                >

                  <button
                    className="mhk-share-option"
                    onClick={
                      handleNativeShare
                    }
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
                    className="mhk-share-option"
                    onClick={copyLink}
                  >
                    🔗 Copy Link
                  </button>

                </div>
              )}

            </div>

          </div>

          {/* =================================================
              COMMENT MESSAGE
          ================================================= */}

          {commentMsg && (
            <div
              style={{
                marginBottom: 18,

                padding: '10px 14px',

                background:
                  commentMsg.startsWith(
                    '❌'
                  )
                    ? 'rgba(192,57,43,.08)'
                    : 'rgba(22,101,52,.08)',

                color:
                  commentMsg.startsWith(
                    '❌'
                  )
                    ? '#c0392b'
                    : '#166534',

                borderRadius: 4,

                fontSize: 12
              }}
            >
              {commentMsg}
            </div>
          )}

          {/* =================================================
              AUTHOR BOX
          ================================================= */}

          <div
            style={{
              background: '#f0ece0',

              padding: '18px',

              display: 'flex',

              gap: 14,

              alignItems: 'flex-start',

              marginBottom: 24,

              border:
                '1px solid #e8e4d8',

              borderRadius: 4
            }}
          >

            {authorAvatar && (
              <img
                src={imgUrl(authorAvatar)}
                alt=""
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    PLACEHOLDER;
                }}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0,
                  border:
                    '2px solid #e8e4d8'
                }}
              />
            )}

            <div>

              <div
                style={{
                  fontFamily:
                    "'Barlow Condensed',sans-serif",

                  fontSize: 9,

                  letterSpacing: 2,

                  textTransform:
                    'uppercase',

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
                    "'Playfair Display',serif",

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

          {/* =================================================
              INLINE ADS
          ================================================= */}

          <AdBanner
            ads={ads.slice(0, 3)}
            height={90}
          />

          {/* =================================================
              RELATED STORIES
          ================================================= */}

          {related.length > 0 && (
            <section
              style={{
                marginBottom: 28
              }}
            >

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

                {related.map((s) => (
                  <Link
                    key={
                      s._id ||
                      s.id
                    }
                    to={`/story/${
                      s._id ||
                      s.id
                    }`}
                    className="mhk-related-card"
                    style={{
                      textDecoration:
                        'none',

                      color: 'inherit',

                      display: 'block',

                      borderRadius: 6
                    }}
                  >

                    <img
                      className="mhk-related-img"
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
                        width: '100%',

                        aspectRatio:
                          '16/10',

                        height: 'auto',

                        objectFit:
                          'cover',

                        marginBottom: 6,

                        borderRadius: 6,

                        display: 'block'
                      }}
                    />

                    <div
                      style={{
                        fontFamily:
                          "'Barlow Condensed',sans-serif",

                        fontSize: 9,

                        color: '#c0392b',

                        fontWeight: 800,

                        letterSpacing: 2,

                        marginBottom: 3
                      }}
                    >
                      {s.category}
                    </div>

                    <div
                      style={{
                        fontFamily:
                          "'Playfair Display',serif",

                        fontSize: '.82rem',

                        fontWeight: 700,

                        lineHeight: 1.3
                      }}
                    >
                      {(s.title || '')
                        .substring(
                          0,
                          65
                        )}
                    </div>

                  </Link>
                ))}

              </div>

            </section>
          )}

          {/* =================================================
              DISCUSSION
          ================================================= */}

          <section>

            <SectionLabel>
              Discussion ({comments.length})
            </SectionLabel>

            <div
              style={{
                background:
                  '#f0ece0',

                padding:
                  '26px 20px',

                border:
                  '1px solid #e8e4d8',

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
                    "'Playfair Display',serif",

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

        {/* ===================================================
            RIGHT SIDEBAR
        =================================================== */}

        <aside className="mhk-right-col">

          <div>

            {/* Most Read */}

            <div
              style={{
                background: '#fff',

                border:
                  '1px solid #e8e4d8',

                padding: 16,

                marginBottom: 18,

                borderTop:
                  '3px solid #0d0d0d',

                borderRadius: 2
              }}
            >

              <div
                style={{
                  fontFamily:
                    "'Barlow Condensed',sans-serif",

                  fontWeight: 800,

                  fontSize: 10,

                  letterSpacing: 2.5,

                  textTransform:
                    'uppercase',

                  borderBottom:
                    '3px solid #0d0d0d',

                  paddingBottom: 8,

                  marginBottom: 12
                }}
              >
                🔥 Most Read
              </div>

              {popular.map(
                (p, i) => (
                  <PopularItem
                    key={
                      p._id ||
                      p.id
                    }
                    story={p}
                    rank={i + 1}
                  />
                )
              )}

            </div>

            <NewsletterWidget />

            <AdBanner
              ads={ads.slice(0, 3)}
              height={200}
            />

            <WhatsAppCTA />

          </div>

        </aside>

      </div>

      {/* =====================================================
          BOTTOM SPONSORS
      ===================================================== */}

      {floatAds.length > 0 && (
        <div
          style={{
            marginTop: 40
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

      {/* =====================================================
          COMMENT MODAL
      ===================================================== */}

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
              'rgba(0,0,0,.62)',

            zIndex: 10000,

            display: 'flex',

            alignItems:
              'flex-start',

            justifyContent:
              'center',

            padding:
              '24px 16px',

            overflowY: 'auto',

            backdropFilter:
              'blur(3px)',

            WebkitBackdropFilter:
              'blur(3px)'
          }}
        >

          <div
            className="mhk-modal-card mhk-modal-wrap"
            style={{
              background: '#fff',

              width: '100%',

              maxWidth: 640,

              borderRadius: 8,

              boxShadow:
                '0 24px 64px rgba(0,0,0,.35)',

              overflow: 'hidden',

              marginTop: 24,

              marginBottom: 24
            }}
          >

            {/* Modal Header */}

            <div
              style={{
                display: 'flex',

                alignItems: 'center',

                justifyContent:
                  'space-between',

                padding:
                  '14px 18px',

                borderBottom:
                  '2px solid #0d0d0d',

                background:
                  '#0d0d0d',

                color: '#fff',

                position: 'sticky',

                top: 0,

                zIndex: 2
              }}
            >

              <div>

                <div
                  style={{
                    fontFamily:
                      "'Barlow Condensed',sans-serif",

                    fontSize: 9,

                    letterSpacing: 2,

                    textTransform:
                      'uppercase',

                    color: '#c0392b',

                    fontWeight: 800
                  }}
                >
                  Discussion
                </div>

                <h3
                  style={{
                    fontFamily:
                      "'Playfair Display',serif",

                    fontSize:
                      '1.15rem',

                    fontWeight: 700,

                    margin: 0
                  }}
                >
                  Comments (
                  {comments.length}
                  )

                  {refreshingComments && (
                    <span
                      className="mhk-spin"
                      style={{
                        marginLeft: 10,

                        borderColor:
                          '#fff',

                        borderTopColor:
                          'transparent'
                      }}
                    />
                  )}
                </h3>

              </div>

              <button
                onClick={() =>
                  setShowCommentModal(
                    false
                  )
                }
                aria-label="Close"
                style={{
                  width: 32,

                  height: 32,

                  borderRadius:
                    '50%',

                  background:
                    'rgba(255,255,255,.15)',

                  color: '#fff',

                  border: 'none',

                  cursor: 'pointer',

                  fontSize: 18,

                  display: 'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'center',

                  padding: 0
                }}
              >
                ×
              </button>

            </div>

            {/* =================================================
                APPROVED COMMENTS
            ================================================= */}

            <div
              style={{
                maxHeight:
                  '52vh',

                overflowY:
                  'auto'
              }}
            >

              {comments.length > 0 ? (

                <div
                  style={{
                    padding:
                      '8px 18px'
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
                            '12px 0',

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

                            gap: 10,

                            marginBottom:
                              6
                          }}
                        >

                          <div
                            style={{
                              width: 34,

                              height: 34,

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
                                "'Playfair Display',serif",

                              fontWeight: 700,

                              fontSize: 14,

                              color:
                                '#c0392b',

                              flexShrink: 0
                            }}
                          >
                            {(c.name ||
                              'B')
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <div
                              style={{
                                fontFamily:
                                  "'Barlow Condensed',sans-serif",

                                fontSize: 13,

                                fontWeight: 700
                              }}
                            >
                              {c.name ||
                                'BANYA'}
                            </div>

                            <div
                              style={{
                                fontFamily:
                                  "'Barlow Condensed',sans-serif",

                                fontSize: 10,

                                color: '#bbb'
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
                            fontSize: 13,

                            lineHeight:
                              1.65,

                            paddingLeft:
                              44,

                            margin: 0
                          }}
                        >
                          {c.comment}
                        </p>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div
                  style={{
                    padding:
                      '28px 20px',

                    textAlign:
                      'center'
                  }}
                >

                  <div
                    style={{
                      fontSize: 30,

                      marginBottom: 8
                    }}
                  >
                    💬
                  </div>

                  <p
                    style={{
                      color:
                        '#5a5a5a',

                      fontStyle:
                        'italic',

                      fontSize: 13
                    }}
                  >
                    No approved comments yet.
                    Be the first to comment.
                  </p>

                </div>

              )}

            </div>

            {/* =================================================
                COMMENT FORM
            ================================================= */}

            <div
              style={{
                background:
                  '#f0ece0',

                padding: 18,

                borderTop:
                  '2px solid #e8e4d8'
              }}
            >

              <h4
                style={{
                  fontFamily:
                    "'Playfair Display',serif",

                  fontSize:
                    '1.02rem',

                  fontWeight: 700,

                  marginBottom: 12
                }}
              >
                Leave a Comment
              </h4>

              <form
                onSubmit={
                  handleComment
                }
                style={{
                  display: 'flex',

                  flexDirection:
                    'column',

                  gap: 11
                }}
              >

                <div
                  className="mhk-comment-form-grid"
                >

                  {/* Name */}

                  <div>

                    <label
                      style={{
                        display:
                          'block',

                        fontFamily:
                          "'Barlow Condensed',sans-serif",

                        fontSize: 9,

                        fontWeight: 800,

                        letterSpacing: 2,

                        textTransform:
                          'uppercase',

                        marginBottom: 5,

                        color:
                          '#5a5a5a'
                      }}
                    >
                      Name
                    </label>

                    <input
                      value={
                        form.name
                      }
                      onChange={(e) =>
                        setForm(
                          (f) => ({
                            ...f,

                            name:
                              e.target
                                .value
                          })
                        )
                      }
                      placeholder="Your name…"
                      style={{
                        width: '100%',

                        padding:
                          '10px 12px',

                        border:
                          '1px solid #e8e4d8',

                        background:
                          '#fff',

                        fontSize: 13,

                        fontFamily:
                          'inherit',

                        outline: 'none',

                        boxSizing:
                          'border-box',

                        borderRadius: 3
                      }}
                    />

                  </div>

                  {/* Email */}

                  <div>

                    <label
                      style={{
                        display:
                          'block',

                        fontFamily:
                          "'Barlow Condensed',sans-serif",

                        fontSize: 9,

                        fontWeight: 800,

                        letterSpacing: 2,

                        textTransform:
                          'uppercase',

                        marginBottom: 5,

                        color:
                          '#5a5a5a'
                      }}
                    >
                      Email (optional)
                    </label>

                    <input
                      type="email"
                      value={
                        form.email
                      }
                      onChange={(e) =>
                        setForm(
                          (f) => ({
                            ...f,

                            email:
                              e.target
                                .value
                          })
                        )
                      }
                      placeholder="your@email.com"
                      style={{
                        width: '100%',

                        padding:
                          '10px 12px',

                        border:
                          '1px solid #e8e4d8',

                        background:
                          '#fff',

                        fontSize: 13,

                        fontFamily:
                          'inherit',

                        outline: 'none',

                        boxSizing:
                          'border-box',

                        borderRadius: 3
                      }}
                    />

                  </div>

                </div>

                {/* Comment */}

                <div>

                  <label
                    style={{
                      display:
                        'block',

                      fontFamily:
                        "'Barlow Condensed',sans-serif",

                      fontSize: 9,

                      fontWeight: 800,

                      letterSpacing: 2,

                      textTransform:
                        'uppercase',

                      marginBottom: 5,

                      color:
                        '#5a5a5a'
                    }}
                  >
                    Comment *
                  </label>

                  <textarea
                    value={
                      form.comment
                    }
                    onChange={(e) =>
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
                      width: '100%',

                      padding:
                        '10px 12px',

                      border:
                        '1px solid #e8e4d8',

                      background:
                        '#fff',

                      fontSize: 13,

                      fontFamily:
                        'inherit',

                      outline: 'none',

                      resize: 'vertical',

                      boxSizing:
                        'border-box',

                      borderRadius: 3
                    }}
                  />

                </div>

                {/* Submit */}

                <div
                  style={{
                    display:
                      'flex',

                    gap: 10,

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
                        '#0d0d0d',

                      color: '#fff',

                      border: 'none',

                      padding:
                        '11px 22px',

                      fontFamily:
                        "'Barlow Condensed',sans-serif",

                      fontWeight: 800,

                      fontSize: 11,

                      letterSpacing: 2,

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

                      gap: 8
                    }}
                  >

                    {submitting ? (
                      <>
                        <span
                          className="mhk-spin"
                        />

                        Submitting…
                      </>
                    ) : (
                      'Post Comment'
                    )}

                  </button>

                  {commentMsg && (
                    <p
                      style={{
                        color:
                          commentMsg.startsWith(
                            '❌'
                          )
                            ? '#c0392b'
                            : '#166534',

                        fontSize: 12,

                        margin: 0,

                        padding:
                          '4px 10px',

                        borderRadius: 3,

                        background:
                          commentMsg.startsWith(
                            '❌'
                          )
                            ? 'rgba(192,57,43,.08)'
                            : 'rgba(22,101,52,.08)'
                      }}
                    >
                      {commentMsg}
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
