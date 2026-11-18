import './NotificationSocialPost.scss';

import React, { useRef, useState } from 'react';
import { EmbeddedPost, FacebookProvider } from 'react-facebook';
import { Tweet } from 'react-twitter-widgets';

interface Props {
  postSource: 'facebook' | 'twitter';
  twitterPostId?: string;
  postId?: string;
  facebookPostLink?: string;
  userId?: string;
}

export const NotificationSocialPost = (props: Props) => {
  const { postSource, twitterPostId, facebookPostLink, postId, userId } = props;
  const [isActive, setIsActive] = useState<boolean>(false);
  const socialRef = useRef(null);
  let [realUserId, realPostId] = postId ? postId.split('_') : [];
  if (userId) {
    realUserId = userId;
  }

  if (twitterPostId) {
    realPostId = twitterPostId;
  }
  if (!isActive) {
    return (
      <img
        data-slot={'notification-social-post'}
        className="notification-social-placeholder"
        onClick={() => {
          setIsActive(true);
        }}
        src={`https://social-widget-generator.rankingcoach.com/${postSource}?density=2&user_id=${realUserId}&post_id=${realPostId}&type=photo`}
      />
    );
  }
  const realFacebookLink = `${facebookPostLink}/posts/${realPostId};`;
  return (
    <div data-slot={'notification-social-post'} ref={socialRef} className={'notification-social-post-body '}>
      {postSource === 'facebook' ? (
        <FacebookProvider appId="212384205474225">
          <div>
            <EmbeddedPost
              handleParse={() => {
                alert('parseDone');
              }}
              href={realFacebookLink}
              width="706"
            />
          </div>
        </FacebookProvider>
      ) : (
        <Tweet tweetId={twitterPostId ? twitterPostId : '841418541026877441'} />
      )}
    </div>
  );
};
