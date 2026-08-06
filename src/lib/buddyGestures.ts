/** CalmLink gesture poses for BuddyGestureCarousel (see references/calmlink-assets/ASSETS.md). */
export type BuddyPose = {
  src: string;
  alt: string;
};

export const BUDDY_GESTURE_POSES: BuddyPose[] = [
  {
    src: '/illustrations/dhira_orb.png',
    alt: 'DHIRA, a small robot buddy holding a glowing light',
  },
  {
    src: '/illustrations/dhira_sitting_calm.png',
    alt: 'DHIRA, a small calm robot buddy, sitting with a hand on its heart',
  },
  {
    src: '/illustrations/dhira_sitting_hi.png',
    alt: 'DHIRA, waving hello',
  },
  {
    src: '/illustrations/dhira_wave.png',
    alt: 'DHIRA, waving hello',
  },
  {
    src: '/illustrations/dhira_listening_avatar.png',
    alt: 'DHIRA, listening',
  },
];

export const VOICE_BUDDY_POSE: BuddyPose = {
  src: '/illustrations/dhira_listening_avatar.png',
  alt: 'DHIRA, listening during your voice call',
};
