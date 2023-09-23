"use client";
import Image from "next/image";
// import "./page.css";
import React, { useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

export interface pageProps {}
export default function CarouselComponent({}: pageProps) {
  const [centerMode, setCenterMode] = useState(false); // Initialize with false for mobile

  // Define breakpoints for switching centerMode
  const mobileBreakpoint = 768; // Example breakpoint for mobile devices

  useEffect(() => {
    // Function to handle window resize event
    const handleResize = () => {
      // Check the current viewport width
      if (window.innerWidth < mobileBreakpoint) {
        setCenterMode(false); // Set centerMode to false for mobile
      } else {
        setCenterMode(true); // Set centerMode to true for desktop
      }
    };

    // Add a listener for the window resize event
    window.addEventListener("resize", handleResize);

    // Initial check on component mount
    handleResize();

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array to run this effect only once on mount

  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      slidesToSlide: 1, // optional, default to 1.
    },
    tablet: {
      breakpoint: { max: 1024, min: 752 },
      items: 2,
      slidesToSlide: 1, // optional, default to 1.
    },
    mobile: {
      breakpoint: { max: 752, min: 0 },
      items: 1,
      slidesToSlide: 1, // optional, default to 1.
    },
  };
  const posts = [
    {
      image: "/images/1.jpg",
      heading: "Video Calls",
      para: [
        "Video Meeting on the go",
        "with screen share",
        "and background remove",
      ],
    },
    {
      image: "/images/2.jpg",
      heading: "Group Chat",
      para: ["Hassle-free communication", "with image and video support"],
    },
    {
      image: "/images/3.jpg",
      heading: "Collaborate",
      para: ["Create and edit documents,", "draw on canvas,", "all with sync"],
    },
  ];
  return (
    <div className="mt-10">
      <Carousel
        additionalTransfrom={0}
        arrows
        autoPlaySpeed={3000}
        centerMode={centerMode}
        containerClass="container-with-dots"
        dotListClass=""
        draggable
        focusOnSelect={false}
        infinite={true}
        itemClass=""
        keyBoardControl
        minimumTouchDrag={20}
        pauseOnHover
        renderArrowsWhenDisabled={false}
        renderButtonGroupOutside={false}
        renderDotsOutside={false}
        responsive={responsive}
        rewind={false}
        rewindWithAnimation={false}
        rtl={false}
        shouldResetAutoplay
        showDots={false}
        sliderClass=""
        swipeable
        ssr={false}
      >
        {posts.map((p) => (
          <div className=" flex flex-col items-center justify-center text-center">
            <img
              className="rounded-2xl"
              src={p.image}
              width={400}
              height={400}
              alt={"any"}
            />
            <h2 className="mt-1 scroll-m-20 border-b  text-xl font-semibold tracking-tight transition-colors first:mt-0">
              {p.heading}
            </h2>{" "}
            {p.para.map((t) => (
              <p className="text-sm"> {t}</p>
            ))}
          </div>
        ))}
      </Carousel>{" "}
    </div>
  );
}
