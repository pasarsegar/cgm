
export type BlockType = 'hero' | 'text' | 'image' | 'button' | 'columns' | 'slider' | 'latest-products' | 'container' | 'product' | 'gallery' | 'video';

export interface BuilderBlock {
  id: string;
  type: BlockType;
  content: any; // Flexible content structure depending on type
}

export const initialBlockContent: Record<BlockType, any> = {
  gallery: {
    images: [], // Array of {url, alt}
    columns: "3", // 2, 3, 4
    gap: "4"
  },
  video: {
    url: "", // YouTube/Vimeo or Direct URL
    type: "youtube", // youtube, vimeo, custom
    autoPlay: false,
    loop: false,
    muted: false
  },
  product: {
    productId: "", // Selected product ID
    showTitle: true,
    showPrice: true,
    showButton: true
  },
  container: {
    direction: "row", // row, column
    justify: "start", // start, center, end, between, around
    align: "start", // start, center, end, stretch
    gap: "4", // Tailwind spacing
    padding: "4",
    backgroundColor: "transparent",
    children: [] // Array of BuilderBlock
  },
  hero: {
    title: "Hero Title",
    subtitle: "Hero Subtitle",
    backgroundImage: "",
    buttonText: "Learn More",
    buttonLink: "#"
  },
  text: {
    html: "<p>Start writing your content here...</p>",
    noContainer: false,
    color: "#333333",
    fontSize: "16px",
    fontFamily: "inherit"
  },
  image: {
    url: "",
    alt: "",
    caption: ""
  },
  button: {
    text: "Click Me",
    url: "#",
    alignment: "left" // left, center, right
  },
  columns: {
    type: "2-col", // 2-col, 3-col, 4-col, 2-col-left-small, 2-col-right-small
    columns: [[], [], [], []] // Array of arrays of BuilderBlock. Init with 4 empty arrays to be safe.
  },
  slider: {
    alias: "home-slider" // For RevSlider alias
  },
  'latest-products': {
    title: "Latest Products",
    count: 3
  }
};
