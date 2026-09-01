// Secret Heart V22 photo slots
// Add only NEW Secret Heart photos inside: public/secret-heart/new-photos/
// Supported extensions: .jpg, .jpeg, .png, .webp
// The Secret Heart experience no longer falls back to the main website photos.

const photoVariants = (name) => [
  `/secret-heart/new-photos/${name}.jpg`,
  `/secret-heart/new-photos/${name}.jpeg`,
  `/secret-heart/new-photos/${name}.png`,
  `/secret-heart/new-photos/${name}.webp`
];

export const SECRET_HEART_PHOTOS = {
  portrait: photoVariants('agnes-main'),

  memories: [
    photoVariants('memory-01'),
    photoVariants('memory-02'),
    photoVariants('memory-03'),
    photoVariants('memory-04'),
    photoVariants('memory-05'),
    photoVariants('memory-06')
  ],

  proposalMain: photoVariants('proposal-main'),
  proposalSmall: photoVariants('proposal-small'),
  keepsake: photoVariants('keepsake')
};
