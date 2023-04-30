import {
  InterfaceText,
  ResponsiveNBox,
} from './Misc';
import React, { useState } from 'react';
import classNames  from 'classnames';
import Sefaria  from './sefaria/sefaria';
import $  from './sefaria/sefariaJquery';
import { NavSidebar, Modules }from './NavSidebar';
import Footer  from './Footer';
import Component from 'react-class';


const CalendarsPage = ({multiPanel, initialWidth}) => {

  const calendars = reformatCalendars();

  const parashaCalendars = ["Parashat Hashavua", "Haftarah (A)", "Haftarah (S)", "Haftarah"];
  const dailyCalendars   = [/* "Daf Yomi", "929", "Daily Mishnah",*/ "Daily Rambam (1 Chapter)", "Daily Rambam",
    /*"Halakhah Yomit", "Arukh HaShulchan Yomi", "Tanakh Yomi", "Zohar for Elul", "Chok LeYisrael",*/ "Tanya Yomi"];
  const weeklyCalendars  = [/*"Daf a Week"*/];

  const makeListings = list => calendars.filter(c => list.indexOf(c.title.en) != -1)
                              .map(c => <CalendarListing calendar={c} />);

  const parashaListings = makeListings(parashaCalendars);
  const dailyListings   = makeListings(dailyCalendars);
  const weeklyListings  = makeListings(weeklyCalendars);

  const about = multiPanel ? null :
    <Modules type={"AboutLearningSchedules"} />

  const sidebarModules = [
    multiPanel ? {type: "AboutLearningSchedules"} : {type: null},
    {type: "StayConnected"},
    {type: "SupportSefaria"},
    {type: "Promo"},
  ];

  return (
    <div className="readerNavMenu" key="0">
      <div className="content">
        <div className="sidebarLayout">
          <div className="contentInner">
            {about}
            <h2 className="styledH1 sans-serif"><InterfaceText>Weekly Torah Portion</InterfaceText></h2>
            <div className="readerNavCategories">
              <ResponsiveNBox content={parashaListings} initialWidth={initialWidth} />
            </div>
            <h2 className="styledH1 sans-serif"><InterfaceText>Daily Learning</InterfaceText></h2>
            <div className="readerNavCategories">
              <ResponsiveNBox content={dailyListings} initialWidth={initialWidth} />
            </div>
            {/*<h2 className="styledH1 sans-serif"><InterfaceText>Weekly Learning</InterfaceText></h2>*/}
            <div className="readerNavCategories">
              <ResponsiveNBox content={weeklyListings} initialWidth={initialWidth} />
            </div>
          </div>
          <NavSidebar modules={sidebarModules} />
        </div>
        <Footer />
      </div>
    </div>
  );
};


const CalendarListing = ({calendar}) => {
  const style = {"borderColor": Sefaria.palette.categoryColor(calendar.category)};
  return (
    <div className="navBlock withColorLine calendarListing" style={style}>
      <a href={`/${calendar.url}`} className="navBlockTitle">
        <InterfaceText text={calendar.displayTitle} />
        {calendar.enSubtitle ?
        <span className="subtitle">
          <InterfaceText context="CalendarListing">{calendar.enSubtitle}</InterfaceText>
        </span> : null }
      </a>
      <div className="calendarRefs">
        {calendar.refs.map(ref => (
        <div className="calendarRef" key={ref.url}>
          <img src="/static/icons/book.svg" className="navSidebarIcon" alt="book icon" />
          <a href={`/${ref.url || calendar.url}`} className="">
            <InterfaceText text={ref.displayValue} />
          </a>
        </div>
        ))}
      </div>          
      { calendar.description ?
      <div className="navBlockDescription">
        <InterfaceText text={calendar.description} />
      </div>
      : null}
    </div>
  );
};


const reformatCalendars = () => {
  // Reformats the calendar data as it is given by the API into the shape we need,
  // combining with descriptions written here.
  const calendars = Sefaria.util.clone(Sefaria.calendars);
  const mergedCalendars = [];
  calendars.map(cal => {
    let calData = calendarDescriptions[cal.title.en.replace(/ \([AS]\)$/, "")]
    if (!cal.description && calData) {
      cal.description = {en: calData.en, he: calData.he};
    }
    if (cal.title.en === "Parashat Hashavua") {
      cal.displayTitle = cal.displayValue;
      cal.displayValue = {en: cal.ref, he: cal.heRef};
    } else {
      cal.displayTitle = Sefaria.util.clone(cal.title);
      if (calData && calData.enSubtitle) {
        cal.enSubtitle = calData.enSubtitle;
      }
      if (calData && calData.heSubtitle) {
        cal.heSubtitle = calData.heSubtitle;
      }
    }

    // Merge multiple calendar entries that from from the same schedule
    // (e.g., when a Haftarah has multiple refs)
    let len = mergedCalendars.length;
    if (len && cal.title.en === mergedCalendars[len-1].title.en) {
      mergedCalendars[len-1].refs.push({url: cal.url, displayValue: cal.displayValue});
    } else {
      cal.refs = [{url: cal.url, displayValue: cal.displayValue}];
      mergedCalendars.push(cal);
    }
  });

  return mergedCalendars;
};


const calendarDescriptions = {
  "Parashat Hashavua": {},
  "Haftarah": {
    en: "",
    he: ""
  },
  "Daf Yomi": {
    en: "",
    he: "",
    enSubtitle: "Talmud",
  },
  "929": {
    en: "",
    he: "",
    enSubtitle: "Tanakh",
  },
  "Daily Mishnah": {
    en: "",
    he: ""
  },
  "Daily Rambam (1 Chapter)": {
    en: "",
    he: ""
  },
  "Daily Rambam": {
    en: "",
    he: "",
  },
  "Daf a Week": {
    en: "",
    he: "",
    enSubtitle: "Talmud",
  },
  "Halakhah Yomit": {
    en: "",
    he: "",
  },
  "Arukh HaShulchan Yomi": {
    en: "",
    he: "",
  },
  "Tanya Yomi": {
    "en": "",
    "he": ""
  },
  "Tanakh Yomi": {
    en: "",
    he: "",
    enSubtitle: "Tanakh",
  },
  "Zohar for Elul": {
    en: "",
    he: "",
  },
  "Chok LeYisrael": {
    en: "",
    he: "",
  }
}


export default CalendarsPage;