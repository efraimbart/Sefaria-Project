import {
  CloseButton,
  MenuButton,
  DisplaySettingsButton,
  CategoryAttribution,
  CategoryColorLine,
  LoadingMessage,
  NBox,
  ResponsiveNBox,
  TabView,
  InterfaceText,
  ContentText, EnglishText, HebrewText, LanguageToggleButton,
} from './Misc';

import React, { useState, useRef }  from 'react';
import ReactDOM  from 'react-dom';
import $  from './sefaria/sefariaJquery';
import Sefaria  from './sefaria/sefaria';
import { NavSidebar, Modules } from './NavSidebar';
import DictionarySearch  from './DictionarySearch';
import VersionBlock  from './VersionBlock';
import ExtendedNotes from './ExtendedNotes';
import Footer  from './Footer';
import classNames  from 'classnames';
import PropTypes  from 'prop-types';
import Component   from 'react-class';
import {ContentLanguageContext} from './context';
import Hebrew from './sefaria/hebrew.js';
import Cookies from 'js-cookie';



class BookPage extends Component {
  // Menu for the Table of Contents for a single text
  constructor(props) {
    super(props);

    this.state = {
      versions: [],
      versionsLoaded: false,
      currentVersion: null,
      currObjectVersions: {en: null, he: null},
      indexDetails: Sefaria.getIndexDetailsFromCache(props.title),
      dlVersionTitle: null,
      dlVersionLanguage: null,
      dlVersionFormat: null,
      dlReady: false
    };
  }
  componentDidMount() {
    this.loadData();
  }
  componentDidUpdate(prevProps, prevState) {
    if ((this.props.settingsLanguage != prevProps.settingsLanguage)) {
      this.forceUpdate();
    }
  }
  getDataRef() {
    // Returns ref to be used to looking up data
    return Sefaria.sectionRef(this.props.currentRef) || this.props.currentRef;
  }
  getData() {
    // Gets data about this text from cache, which may be null.
    return Sefaria.text(this.getDataRef(), {context: 1, enVersion: this.props.currVersions.en, heVersion: this.props.currVersions.he});
  }
  loadData() {
    // Ensures data this text is in cache, rerenders after data load if needed
    Sefaria.getIndexDetails(this.props.title).then(data => this.setState({indexDetails: data}));

    if (this.isBookToc() && !this.props.compare) {
      if(!this.state.versionsLoaded){
        Sefaria.getVersions(this.props.title, false, null, false).then(this.onVersionsLoad);
      }
    }
  }
  onVersionsLoad(versions){
    this.setState({versions: versions, currObjectVersions: this.makeFullCurrentVersionsObjects(versions), versionsLoaded: true})
  }
  makeFullCurrentVersionsObjects(versions){
    //build full versions of current object versions
    let currObjectVersions = {en: null, he: null};
    for(let [lang,ver] of Object.entries(this.props.currVersions)){
      if(!!ver){
        let fullVer = versions.find(version => version.versionTitle == ver && version.language == lang);
        currObjectVersions[lang] = fullVer ? fullVer : null;
      }
    }
    return currObjectVersions;
  }
  getCurrentVersion() {
    // For now treat bilingual as english. TODO show attribution for 2 versions in bilingual case.
    if (this.isBookToc()) { return null; }
    let d = this.getData();
    if (!d) { return null; }
    let currentLanguage = this.props.settingsLanguage == "he" ? "he" : "en";
    if (currentLanguage == "en" && !d.text.length) {currentLanguage = "he"}
    if (currentLanguage == "he" && !d.he.length) {currentLanguage = "en"}
    let currObjectVersions;
    if(this.state.versions.length){
      currObjectVersions = this.state.currObjectVersions;
    }else{
      currObjectVersions = this.makeFullCurrentVersionsObjects(d.versions);
    }
    let currentVersion = {
      ... currObjectVersions[currentLanguage],
      ...{
        sources: currentLanguage == "he" ? d.heSources : d.sources,
        language:               currentLanguage,
        versionTitle:           currentLanguage == "he" ? d.heVersionTitle : d.versionTitle,
        versionSource:          currentLanguage == "he" ? d.heVersionSource : d.versionSource,
        versionStatus:          currentLanguage == "he" ? d.heVersionStatus : d.versionStatus,
        license:                currentLanguage == "he" ? d.heLicense : d.license,
        sources:                currentLanguage == "he" ? d.heSources : d.sources,
        versionNotes:           currentLanguage == "he" ? d.heVersionNotes : d.versionNotes,
        digitizedBySefaria:     currentLanguage == "he" ? d.heDigitizedBySefaria : d.digitizedBySefaria,
        versionTitleInHebrew: currentLanguage == "he" ? d.heVersionTitleInHebrew : d.VersionTitleInHebrew,
        versionNotesInHebrew: currentLanguage == "he" ? d.heVersionNotesInHebrew : d.VersionNotesInHebrew,
        extendedNotes:        currentLanguage == "he" ? d.heExtendedNotes : d.extendedNotes,
        extendedNotesHebrew:  currentLanguage == "he" ? d.extendedNotesHebrew : d.heExtendedNotesHebrew,
      }
    };
    currentVersion.merged = !!(currentVersion.sources);
    return currentVersion;
  }
  openVersion(version, language) {
    // Selects a version and closes this menu to show it.
    // Calling this functon wihtout parameters resets to default
    this.props.selectVersion(version, language);
    this.props.close();
  }
  isBookToc() {
    return (this.props.mode == "book toc")
  }
  isTextToc() {
    return (this.props.mode == "text toc")
  }
  extendedNotesBack(event){
    return null;
  }
  render() {
    const title     = this.props.title;
    const index     = Sefaria.index(title);
    const heTitle   = index ? index.heTitle : title;
    const category  = this.props.category;
    const isDictionary = this.state.indexDetails && !!this.state.indexDetails.lexiconName;
    const categories = Sefaria.index(this.props.title).categories;
    let currObjectVersions = this.state.currObjectVersions;
    let catUrl;
    if (category == "Commentary") {
      catUrl  = "/texts/" + index.categories.slice(0, index.categories.indexOf("Commentary") + 1).join("/");
    } else if (category == "Targum") {
      catUrl  = "/texts/" + index.categories.slice(0, index.categories.indexOf("Targum") + 1).join("/");
    } else {
      catUrl  = "/texts/" + category;
    }

    const readButton = !this.state.indexDetails || this.isTextToc() || this.props.compare ? null :
      Sefaria.lastPlaceForText(title) ?
        <a className="button small readButton" href={"/" + Sefaria.normRef(Sefaria.lastPlaceForText(title).ref)}>
          <InterfaceText>Continue Reading</InterfaceText>
        </a>
        :
        <a className="button small readButton" href={"/" + Sefaria.normRef(this.state.indexDetails["firstSectionRef"])}>
          <InterfaceText>Start Reading</InterfaceText>
        </a>

    const tabs = [{id: "contents", title: {en: "Contents", he: Sefaria._("Contents")}}];
    if (this.isBookToc()){
      tabs.push({id: "versions", title: {en: "Versions", he: Sefaria._("Versions")}});
    }
    const renderTab = t => (
      <div className={classNames({tab: 1, noselect: 1})}>
        <InterfaceText text={t.title} />
        { t.icon ? <img src={t.icon} alt={`${t.title.en} icon`} /> : null }
      </div>
    );

    const sidebarModules = !this.state.indexDetails ? [] :
      [
        this.props.multiPanel ? {type: "AboutText", props: {index: this.state.indexDetails}} : {type: null},
        {type: "RelatedTopics", props: { title: this.props.title}},
        !isDictionary ? {type: "DownloadVersions", props:{sref: this.props.title}} : {type: null},
      ];

    const moderatorSection = Sefaria.is_moderator || Sefaria.is_editor ? (<ModeratorButtons title={title} />) : null;

    const classes = classNames({
      bookPage: 1,
      readerNavMenu: 1,
      fullBookPage: this.isBookToc(),
      narrowPanel: this.props.narrowPanel,
      compare: this.props.compare,
      noLangToggleInHebrew: Sefaria.interfaceLang == 'hebrew'
    });

    return (
      <div className={classes}>
        <CategoryColorLine category={category} />
        {this.isTextToc() || this.props.compare ?
        <>
          <div className="readerControls">
            <div className="readerControlsInner">
              <div className="leftButtons">
                {this.props.compare ?
                <MenuButton onClick={this.props.onCompareBack} compare={true} />
                : <CloseButton onClick={this.props.close} />}
              </div>
              <div className="readerTextToc readerTextTocHeader">
                {this.props.compare ?
                <div className="readerTextTocBox">
                  <InterfaceText>{title}</InterfaceText>
                </div>
                :
                <div className="readerTextTocBox sans-serif">
                  <InterfaceText>Table of Contents</InterfaceText>
                </div>}
              </div>
              <div className="rightButtons">
                {Sefaria.interfaceLang !== "hebrew" ?
                  <DisplaySettingsButton onClick={this.props.openDisplaySettings} />
                  : <DisplaySettingsButton placeholder={true} />}
              </div>
            </div>
          </div>
        </> : null}

        <div className="content">
          <div className="sidebarLayout">
            <div className="contentInner followsContentLang">
              {this.props.compare ? null :
              <div className="tocTop">
                <div className="tocTitle" role="heading" aria-level="1">
                  <div className="tocTitleControls">
                    <ContentText text={{en:title, he:heTitle}}/>
                    {moderatorSection}
                  </div>
                  { this.props.multiPanel && this.props.toggleLanguage && Sefaria.interfaceLang !== "hebrew" && Sefaria._siteSettings.TORAH_SPECIFIC ?
                  <LanguageToggleButton toggleLanguage={this.props.toggleLanguage} /> : null }
                </div>

                <a className="tocCategory" href={catUrl}>
                  <ContentText text={{en:category, he:Sefaria.hebrewTerm(category)}}/>
                </a>

                <CategoryAttribution categories={categories} asEdition={true} />

                {this.state.indexDetails && this.state.indexDetails.dedication ?
                  <div className="dedication">
                    <span>
                      <ContentText html={{en:this.state.indexDetails.dedication.en, he:this.state.indexDetails.dedication.he}}/>
                    </span>
                  </div> : null }
              </div>}

              {this.state.indexDetails ?
              <div>
                {readButton}

                {this.props.multiPanel ? null :
                <div className="about">
                  <Modules type={"AboutText"} props={{index: this.state.indexDetails, hideTitle: true}} />
                </div>}

                 <TabView
                  tabs={tabs}
                  renderTab={renderTab}
                  containerClasses={"largeTabs"}>
                   <TextTableOfContents
                        narrowPanel={this.props.narrowPanel}
                        title={this.props.title}
                        close={this.props.close}
                        showBaseText={this.props.showBaseText}
                        currVersions={this.props.currVersions}
                   />
                   <VersionsList
                     currObjectVersions={currObjectVersions}
                     openVersionInReader={this.openVersion}
                     currentRef={this.props.currentRef}
                     viewExtendedNotes={this.props.viewExtendedNotes}
                   />
                 </TabView>


              </div>
                  :
              <LoadingMessage />
              }
            </div>
            {this.isBookToc() && ! this.props.compare ? 
            <NavSidebar modules={sidebarModules} /> : null}
          </div>
          {this.isBookToc() && ! this.props.compare ?
          <Footer /> : null}
        </div>
      </div>
    );
  }
}
BookPage.propTypes = {
  mode:                  PropTypes.string.isRequired,
  title:                 PropTypes.string.isRequired,
  category:              PropTypes.string.isRequired,
  currentRef:            PropTypes.string.isRequired,
  settingsLanguage:      PropTypes.string.isRequired,
  currVersions:          PropTypes.object.isRequired,
  compare:               PropTypes.bool,
  narrowPanel:           PropTypes.bool,
  close:                 PropTypes.func.isRequired,
  showBaseText:          PropTypes.func.isRequired,
  selectVersion:         PropTypes.func,
  viewExtendedNotes:     PropTypes.func,
  onCompareBack:         PropTypes.func,
  backFromExtendedNotes: PropTypes.func,
  extendedNotes:         PropTypes.string,
  extendedNotesHebrew:   PropTypes.string
};


class TextTableOfContents extends Component {
  // The content section of the text table of contents that includes links to text sections,
  // and tabs for alternate structures and commentary.

  constructor(props) {
    super(props);
    this.state = {
      tab: "schema",
      indexDetails: Sefaria.getIndexDetailsFromCache(props.title)
    };
  }
  componentDidMount() {
    this.loadData();
  }
  loadData(){
    // Ensures data this text is in cache, rerenders after data load if needed
    Sefaria.getIndexDetails(this.props.title).then(data => this.setState({
      indexDetails: data,
      tab: this.getDefaultActiveTab(data)
    }));
  }
  getDefaultActiveTab(indexDetails){
    return ("default_struct" in indexDetails && indexDetails.default_struct in indexDetails?.alts) ? indexDetails.default_struct : "schema";
  }
  setTab(tab) {
    this.setState({tab: tab});
  }
  handleClick(e) {
    const $a = $(e.target).closest("a");
    if ($a.length && ($a.hasClass("sectionLink") || $a.hasClass("linked"))) {
      let ref = $a.attr("data-ref");
      ref = decodeURIComponent(ref);
      ref = Sefaria.humanRef(ref);
      this.props.close();
      this.props.showBaseText(ref, false, this.props.currVersions);
      e.preventDefault();
    }
  }
  render() {
    if(this.state.indexDetails == null){
      return (<LoadingMessage />);
    }
    const isTorah = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"].indexOf(this.props.title) > -1;
    const isDictionary = this.state.indexDetails?.lexiconName;
    const defaultStruct = this.getDefaultActiveTab(this.state.indexDetails);
    const excludedStructs = this.state.indexDetails?.exclude_structs || [];
    const alts = this.state.indexDetails?.alts || {};
    let structTabOptions = [];
    if(!excludedStructs.includes("schema")){
      structTabOptions.push({
        name: "schema",
        text: "sectionNames" in this.state.indexDetails?.schema ? this.state.indexDetails.schema.sectionNames[0] : "Contents",
        onPress: this.setTab.bind(null, "schema")
      })
    }
    for (let alt in alts) {
      if (alts.hasOwnProperty(alt) && !excludedStructs.includes(alt)) {
        structTabOptions.push({
          name: alt,
          text: alt,
          onPress: this.setTab.bind(null, alt)
        });
      }
    }
    structTabOptions = structTabOptions.sort(function(a, b) {
      return a.name == defaultStruct ? -1 :
              b.name == defaultStruct ? 1 : 0;
    }.bind(this));
    const showToggle = !(isDictionary || isTorah) && structTabOptions.length > 1;
    const toggle = (showToggle ?
                  <TabbedToggleSet
                    tabOptions={structTabOptions}
                    activeTab={this.state.tab}
                    narrowPanel={this.props.narrowPanel} /> : null);
    const dictionarySearch = (isDictionary ?
                  <DictionarySearch
                  lexiconName={this.state.indexDetails.lexiconName}
                  title={this.props.title}
                  showBaseText={this.props.showBaseText}
                  contextSelector=".bookPage"
                  currVersions={this.props.currVersions}/> : null);

    let content;
    switch(this.state.tab) {
      case "schema":
        if (isTorah) {
          content = (
            <>
              <SchemaNode
                schema={this.state.indexDetails.schema}
                addressTypes={this.state.indexDetails.schema.addressTypes}
                refPath={this.props.title}
                topLevel={true}
                topLevelHeader={"Chapters"}
              />
              <div className="torahNavParshiot">
                <SchemaNode
                  schema={alts["Parasha"]}
                  addressTypes={this.state.indexDetails.schema.addressTypes}
                  refPath={this.props.title}
                  topLevel={true}
                  topLevelHeader={"Torah Portions"}
                />
              </div>
            </>
          );
        } else {
          content = <SchemaNode
                      schema={this.state.indexDetails.schema}
                      addressTypes={this.state.indexDetails.schema.addressTypes}
                      refPath={this.props.title}
                      topLevel={true}

          />;
        }
        break;
      default:
        content = <SchemaNode
                    schema={alts[this.state.tab]}
                    addressTypes={this.state.indexDetails.schema.addressTypes}
                    refPath={this.props.title}
                    topLevel={true} />;
        break;
    }

    return (
        <div onClick={this.handleClick}>
          <div className="textTableOfContents">
            <div className="tocTools">
              {toggle}
              {dictionarySearch}
            </div>
            <div className="tocContent">
              {content}
            </div>
          </div>
        </div>
    );
  }
}
TextTableOfContents.propTypes = {
    title:           PropTypes.string.isRequired,
    narrowPanel:     PropTypes.bool,
    close:           PropTypes.func,
    showBaseText:    PropTypes.func,
    currVersions:    PropTypes.object
};


const TabbedToggleSet = ({tabOptions, activeTab, narrowPanel}) => {
  let options = tabOptions.map(function(option, i) {
    const handleClick = function(e) {
      e.preventDefault();
      option.onPress();
    }.bind(this);

    let classes = classNames({altStructToggle: 1, "sans-serif": 1, active: activeTab === option.name});
    const url = Sefaria.util.replaceUrlParam("tab", option.name);
    return (
      <div className="altStructToggleBox" key={i}>
        <a className={classes} onClick={handleClick} href={url}>
            <InterfaceText>{option.text}</InterfaceText>
        </a>
      </div>
    );
    }.bind(this));

    let rows = [];
    if (narrowPanel) {
      const rowSize = options.length == 4 ? 2 : 3;
      for (let i = 0; i < options.length; i += rowSize) {
        rows.push(options.slice(i, i+rowSize));
      }
    } else {
      rows = [options];
    }

    return (
        <div className="structToggles">
            {rows.map(function(row, i) {
              return (<div className="structTogglesInner" key={i}>{row}</div>);
            })}
        </div>
    );

}
TabbedToggleSet.propTypes = {
  tabOptions:     PropTypes.array.isRequired, // array of object with `name`. `text`, `heText`, `onPress`
  activeTab:      PropTypes.string.isRequired,
  narrowPanel: PropTypes.bool
};


class SchemaNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Collapse nodes below top level, and those that aren't default or makred includedSections
      collapsed: "nodes" in props.schema ? props.schema.nodes.map(node => !(props.topLevel || node.default || node.includeSections)) : []
    };
  }
  toggleCollapse(i) {
    this.state.collapsed[i] = !this.state.collapsed[i];
    this.setState({collapsed: this.state.collapsed});
  }
  render() {
    if (!("nodes" in this.props.schema)) {
      if (this.props.schema.nodeType === "JaggedArrayNode") {
        return (
          <JaggedArrayNode
            schema={this.props.schema}
            refPath={this.props.refPath}
            topLevel={this.props.topLevel}
            topLevelHeader={this.props.topLevelHeader}
          />
        );
      } else if (this.props.schema.nodeType === "ArrayMapNode") {
        return (
          <ArrayMapNode schema={this.props.schema} />
        );
      } else if (this.props.schema.nodeType === "DictionaryNode") {
        return (
          <DictionaryNode schema={this.props.schema} />
        );
      }

    } else {
      let content = this.props.schema.nodes.map(function(node, i) {
        const includeSections = node?.includeSections ?? true; //either undefined or explicitly true
        let path;
        if ("nodes" in node || ("refs" in node && node.refs.length && includeSections)) {
          // SchemaNode with children (nodes) or ArrayMapNode with depth (refs)
          path = this.props.refPath + ", " + node.title;
          return (
            <div className="schema-node-toc" data-ref={path} key={i}>
              <span className={`schema-node-title ${this.state.collapsed[i] ? "collapsed" : "open"}`}
                    onClick={this.toggleCollapse.bind(null, i)}
                    onKeyPress={function(e) {e.charCode == 13 ? this.toggleCollapse(i):null}.bind(this)}
                    role="heading"
                    aria-level="3"
                    aria-hidden="true" tabIndex={0}>
                <ContentText text={{en: node.title, he: node.heTitle}} />
              </span>
              {!this.state.collapsed[i] ?
              <div className="schema-node-contents">
                <SchemaNode
                  schema={node}
                  refPath={this.props.refPath + ", " + node.title} />
              </div>
              : null }
            </div>);
        } else if (node.nodeType == "ArrayMapNode") {
          // ArrayMapNode with only wholeRef
          return <ArrayMapNode schema={node} key={i}/>;
        } else if (node.nodeType == "DictionaryNode") {
          return <DictionaryNode schema={node} key={i}/>;
        } else if (node.depth == 1 && !node.default) {
          // SchemaNode title that points straight to content
          path = this.props.refPath + ", " + node.title;
          return (
            <a className="schema-node-toc linked" href={"/" + Sefaria.normRef(path)} data-ref={path} key={i}>
              <span className="schema-node-title" role="heading" aria-level="3">
                <ContentText text={{en:node.title , he:node.heTitle }}/>
              </span>
            </a>);
        } else {
          // SchemaNode that has a JaggedArray below it
          return (
            <div className="schema-node-toc janode" key={i}>
              { !node.default ?
              <span className={`schema-node-title ${this.state.collapsed[i] ? "collapsed" : "open"}`}
                    role="heading" aria-level="3" tabIndex={0}
                    onClick={this.toggleCollapse.bind(null, i)}
                    onKeyPress={function(e) {e.charCode == 13 ? this.toggleCollapse(i):null}.bind(this)} >
                <ContentText text={{en: node.title, he: node.heTitle}} />
              </span>
              : null }
              { !this.state.collapsed[i] ?
              <div className="schema-node-contents">
                <JaggedArrayNode
                  schema={node}
                  contentLang={this.props.contentLang}
                  refPath={this.props.refPath + (node.default ? "" : ", " + node.title)} />
              </div>
              : null }
            </div>);
        }
      }.bind(this));
      let topLevelHeader = this.props.topLevel && this.props.topLevelHeader ? (
        <div className="specialNavSectionHeader">
          <ContentText text={{
            en: this.props.topLevelHeader,
            he: Sefaria.hebrewTranslation(this.props.topLevelHeader)
          }}/>
        </div>
      ) : null;
      return (
          <>
            {topLevelHeader}
            <div className="tocLevel">{content}</div>
          </>

      );
    }
  }
}
SchemaNode.propTypes = {
  schema:      PropTypes.object.isRequired,
  refPath:     PropTypes.string.isRequired
};


class JaggedArrayNode extends Component {
  render() {
    if ("toc_zoom" in this.props.schema) {
      let zoom = this.props.schema.toc_zoom - 1;
      return (<JaggedArrayNodeSection
                depth={this.props.schema.depth - zoom}
                sectionNames={this.props.schema.sectionNames.slice(0, -zoom)}
                addressTypes={this.props.schema.addressTypes.slice(0, -zoom)}
                contentCounts={this.props.schema.content_counts}
                refPath={this.props.refPath} />);
    }
    let topLevelHeader = this.props.topLevel && (this.props.schema?.depth <= 2 || this.props.topLevelHeader) ? (
        <div className="specialNavSectionHeader">
          <ContentText text={{
            en: this.props.topLevelHeader || this.props.schema?.sectionNames[0] || "Chapters",
            he: Sefaria.hebrewTranslation(this.props.topLevelHeader || this.props.schema?.sectionNames[0] || "Chapters")
          }}/>
        </div>
    ) : null;
    return (
        <>
          {topLevelHeader}
          <JaggedArrayNodeSection
                depth={this.props.schema.depth}
                sectionNames={this.props.schema.sectionNames}
                addressTypes={this.props.schema.addressTypes}
                contentCounts={this.props.schema.content_counts}
                refPath={this.props.refPath} />
        </>
    );
  }
}
JaggedArrayNode.propTypes = {
  schema:      PropTypes.object.isRequired,
  refPath:     PropTypes.string.isRequired
};


class JaggedArrayNodeSection extends Component {
  contentCountIsEmpty(count) {
    // Returns true if count is zero or is an an array (of arrays) of zeros.
    if (typeof count == "number") { return count == 0; }
    let innerCounts = count.map(this.contentCountIsEmpty);
    return innerCounts.unique().compare([true]);
  }
  refPathTerminal(count) {
    // Returns a string to be added to the end of a section link depending on a content count
    // Used in cases of "zoomed" JaggedArrays, where `contentCounts` is deeper than `depth` so that zoomed section
    // links still point to section level.
    if (typeof count == "number") { return ""; }
    let terminal = ":";
    for (let i = 0; i < count.length; i++) {
      if (count[i]) {
        terminal += (i+1) + this.refPathTerminal(count[i]);
        break;
      }
    }
    return terminal;
  }
  render() {
    if (this.props.depth > 2) {
      let content = [];
      let enSection, heSection;
      for (let i = 0; i < this.props.contentCounts.length; i++) {
        if (this.contentCountIsEmpty(this.props.contentCounts[i])) { continue; }
        if (this.props.addressTypes[0] === "Talmud") {
          enSection = Sefaria.hebrew.intToDaf(i);
          heSection = Sefaria.hebrew.encodeHebrewDaf(enSection);
        } else if (this.props.addressTypes[0] === "Year") {
          enSection = i + 1241;
          heSection = Sefaria.hebrew.encodeHebrewNumeral(i+1);
          heSection = heSection.slice(0,-1) + '"' + heSection.slice(-1)
        }
        else {
          enSection = i+1;
          heSection = Sefaria.hebrew.encodeHebrewNumeral(i+1);
        }
        content.push(
          <div className="tocSection" key={i}>
            <div className="sectionName">
              <ContentText text={{ en:this.props.sectionNames[0] + " " + enSection , he: Sefaria.hebrewTerm(this.props.sectionNames[0]) + " " +heSection}}/>
            </div>
            <JaggedArrayNodeSection
              depth={this.props.depth - 1}
              sectionNames={this.props.sectionNames.slice(1)}
              addressTypes={this.props.addressTypes.slice(1)}
              contentCounts={this.props.contentCounts[i]}
              refPath={this.props.refPath + ":" + enSection} />
          </div>);
      }
      return ( <div className="tocLevel">{content}</div> );
    }
    let contentCounts = this.props.depth == 1 ? new Array(this.props.contentCounts).fill(1) : this.props.contentCounts;
    let sectionLinks = [];
    let section, heSection;
    for (let i = 0; i < contentCounts.length; i++) {
      if (this.contentCountIsEmpty(contentCounts[i])) { continue; }
      if (this.props.addressTypes[0] === "Talmud") {
          section = Sefaria.hebrew.intToDaf(i);
          heSection = Sefaria.hebrew.encodeHebrewDaf(section);
        } else if (this.props.addressTypes[0] === "Year") {
          section = i + 1241;
          heSection = Sefaria.hebrew.encodeHebrewNumeral(i+1);
          heSection = heSection.slice(0,-1) + '"' + heSection.slice(-1)
        }
        else {
          section = i+1;
          heSection = Sefaria.hebrew.encodeHebrewNumeral(i+1);
        }
      let ref  = (this.props.refPath + ":" + section).replace(":", " ") + this.refPathTerminal(contentCounts[i]);
      let link = (
        <a className="sectionLink" href={"/" + Sefaria.normRef(ref)} data-ref={ref} key={i}>
          <ContentText text={{en:section, he:heSection}}/>
        </a>
      );
      sectionLinks.push(link);
    }
    return (
      <div className="tocLevel">{sectionLinks}</div>
    );
  }
}
JaggedArrayNodeSection.propTypes = {
  depth:           PropTypes.number.isRequired,
  sectionNames:    PropTypes.array.isRequired,
  addressTypes:    PropTypes.array.isRequired,
  contentCounts:   PropTypes.oneOfType([
                      PropTypes.array,
                      PropTypes.number
                    ]),
  refPath:         PropTypes.string.isRequired,
};


class ArrayMapNode extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const includeSections = this.props.schema?.includeSections ?? true; //either undefined or explicitly true
    if ("refs" in this.props.schema && this.props.schema.refs.length && includeSections) {
      let section, heSection;
      let sectionLinks = this.props.schema.refs.map(function(ref, i) {
        i += this.props.schema.offset || 0;
        if (ref === "") {
          return null;
        }
        if (this.props.schema.addressTypes[0] === "Talmud") {
          section = Sefaria.hebrew.intToDaf(i);
          heSection = Sefaria.hebrew.encodeHebrewDaf(section);
        } else if (this.props.schema.addressTypes[0] === "Folio") {
          section = Sefaria.hebrew.intToFolio(i);
          heSection = Sefaria.hebrew.encodeHebrewFolio(section);
        } else {
          section = i+1;
          heSection = Sefaria.hebrew.encodeHebrewNumeral(i+1);
        }
        return (
          <a className="sectionLink" href={"/" + Sefaria.normRef(ref)} data-ref={ref} key={i}>
            <ContentText text={{en:section, he:heSection}}/>
          </a>
        );
      }.bind(this));

      return (<div>{sectionLinks}</div>);

    } else {
      return (
        <a className="schema-node-toc linked" href={"/" + Sefaria.normRef(this.props.schema.wholeRef)} data-ref={this.props.schema.wholeRef}>
          <span className="schema-node-title" role="heading" aria-level="3">
            <ContentText text={{en:this.props.schema.title, he:this.props.schema.heTitle}}/>
          </span>
        </a>);
    }
  }
}
ArrayMapNode.propTypes = {
  schema:      PropTypes.object.isRequired
};


class DictionaryNode extends Component {
  render() {
    if (this.props.schema.headwordMap) {
      let sectionLinks = this.props.schema.headwordMap.map(function(m,i) {
      let letter = m[0];
      let ref = m[1];
      return (
          <a className="sectionLink" href={"/" + Sefaria.normRef(ref)} data-ref={ref} key={i}>
            <ContentText text={{en:letter, he:letter}} />
          </a>
        );
      });
      return (
          <div className="schema-node-toc">
            <div className="schema-node-contents">
              <div className="specialNavSectionHeader">
                <ContentText text={{en: "Browse By Letter", he: 'לפי סדר הא"ב'}}/>
              </div>
              <div className="tocLevel">{sectionLinks}</div>
            </div>
          </div>
      );
    }
  }
}
DictionaryNode.propTypes = {
  schema:      PropTypes.object.isRequired
};


class VersionsList extends Component {
  componentDidMount() {
    Sefaria.getVersions(this.props.currentRef, false, [], true).then(this.onVersionsLoad);
  }
  onVersionsLoad(versions){
    versions.sort(
      (a, b) => {
        if      (a.priority > b.priority)                {return -1;}
        else if (a.priority < b.priority)                {return 1;}
        else if (a.versionTitle < b.versionTitle)        {return -1;}
        else if (a.versionTitle > b.versionTitle)        {return  1;}
        else                                             {return  0;}
      }
    );
    this.setState({versions: versions});
  }
  render() {
    if (!this?.state?.versions) {
        return (
          <div className="versionsBox">
            <LoadingMessage />
          </div>
        );
    }
    let versions = this.state.versions;
    let vblocks = versions.map(v =>
      <VersionBlock
        rendermode="book-page"
        version={v}
        currObjectVersions={this.props.currObjectVersions}
        currentRef={this.props.currentRef}
        firstSectionRef={"firstSectionRef" in v ? v.firstSectionRef : null}
        openVersionInReader={this.props.openVersionInReader}
        viewExtendedNotes={this.props.viewExtendedNotes}
        key={v.versionTitle + "/" + v.language}/>
     );
    return (
      <div className="versionsBox">
        {vblocks}
      </div>
    );
  }
}
VersionsList.propTypes = {
  currentRef:                PropTypes.string,
  currObjectVersions:        PropTypes.object,
  openVersionInReader:       PropTypes.func,
  viewExtendedNotes:         PropTypes.func,
};


class ModeratorButtons extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: false,
      message: null,
      editing: false,
    }
  }
  expand() {
    this.setState({expanded: true});
  }
  collapse() {
    this.setState({expanded: false});
  }
  editIndex() {
    //window.location = "/edit/textinfo/" + this.props.title;
    this.setState({editing: true})
  }
  addSection() {
    window.location = "/add/" + this.props.title;
  }
  deleteIndex() {
    const title = this.props.title;

    const confirm = prompt("Are you sure you want to delete this text version? Doing so will completely delete this text from Sefaria, including all existing versions, translations and links. This action CANNOT be undone. Type DELETE to confirm.", "");
    if (confirm !== "DELETE") {
      alert("Delete canceled.");
      return;
    }

    const url = "/api/index/" + title;
    $.ajax({
      url: url,
      type: "DELETE",
      success: function(data) {
        if ("error" in data) {
          alert(data.error)
        } else {
          alert("Text Deleted.");
          window.location = "/";
        }
      }
    }).fail(function() {
      alert("Something went wrong. Sorry!");
    });
    this.setState({message: "Deleting text (this may time a while)..."});
  }
  render() {
    if (!this.state.expanded) {
      return (<div className="moderatorSectionExpand" onClick={this.expand}>
                <i className="fa fa-cog"></i>
              </div>);
    }
    let editTextInfo = <div className="button white" onClick={this.editIndex}>
                          <span><i className="fa fa-info-circle"></i> Edit Text Info</span>
                          {this.state.editing ? <EditTextInfo title={this.props.title}/> : null}
                        </div>;
    let addSection   = <div className="button white" onClick={this.addSection}>
                          <span><i className="fa fa-plus-circle"></i> Add Section</span>
                        </div>;
    let deleteText   = <div className="button white" onClick={this.deleteIndex}>
                          <span><i className="fa fa-exclamation-triangle"></i> Delete {this.props.title}</span>
                        </div>
    let textButtons = (<span className="moderatorTextButtons">
                          {Sefaria.is_moderator ? editTextInfo : null}
                          {Sefaria.is_moderator || Sefaria.is_editor ? addSection : null}
                          {Sefaria.is_moderator ? deleteText : null}
                          <span className="moderatorSectionCollapse" onClick={this.collapse}><i className="fa fa-times"></i></span>
                        </span>);
    let message = this.state.message ? (<div className="moderatorSectionMessage">{this.state.message}</div>) : null;
    return (<div className="moderatorSection">
              {textButtons}
              {message}
            </div>);
  }
}
ModeratorButtons.propTypes = {
  title: PropTypes.string.isRequired,
};


function TOCDropdown({categories}) {
  //initially set up one level of the menu, on selecting anything but "Choose a category"
  const [children, setChildren] = useState(categories);
  const categoryMenu = useRef();

  const handleChange = function(e) {
    let newChildren = [];
    for (let i=0; i<children.length; i++) {
      let el = categoryMenu.current.children[i];
      if (el.options[el.selectedIndex].value === "Choose a category" || Sefaria.tocItemsByCategories(children.slice(0, i+1)).length === 0) {
        //first test says dont include "Choose a category" and anything after it in categories.
        //second test is if categories are ["Talmud", "Prophets"], set children to ["Talmud"]
        break;
      }
      newChildren.push(el.options[el.selectedIndex].value);
    }
    setChildren(newChildren);
  }

  let menus = [];

  //create a menu of first level categories
  let options = Sefaria.toc.map(function(child, key) {
    if (children.length > 0 && children[0] === child.category) {
      return <option key={key} value={children[0]} selected>{children[0]}</option>;
    }
    else {
      return <option key={key} value={child.category}>{child.category}</option>
    }
  });
  menus.push(options);

  //now add to menu second and/or third level categories found in children
  for (let i=0; i<children.length; i++) {
    let options = [];
    let subcats = Sefaria.tocItemsByCategories(children.slice(0, i+1));
    for (let j=0; j<subcats.length; j++) {
      if (subcats[j].hasOwnProperty("contents")) {
        if (children.length >= i && children[i+1] === subcats[j].category) {
          options.push(<option key={j} value={children[i+1]} selected>{subcats[j].category}</option>);
        }
        else
        {
          options.push(<option key={j} value={subcats[j].category}>{subcats[j].category}</option>);
        }
      }
    }
    if (options.length > 0) {
      menus.push(options);
    }
  }
  return <div id="categoryMenu" ref={categoryMenu}>
          {menus.map((menu, index) =>
            <select id={`subcats-${index}`} onChange={handleChange}>
              <option key="chooseCategory" value="Choose a category">Choose a category</option>
              {menu}
           </select>)}
         </div>
}

function EditTextInfo({title}) {
  Sefaria.getIndexDetails(title); //is this necessary?
  const index = useRef(Sefaria.getIndexDetailsFromCache(title));
  const enTitle = useRef("");
  const heTitle = useRef("");
  const enTitleVariants = useRef("");
  const heTitleVariants = useRef("");
  const categories = useRef([]);
  const oldEnTitle = useRef("");  //only gets set when editing existing Index record's title

  // const loadIndex = function() {
  //
  //
  //   // Make list of categories currently in the select
  //   var cats = {};
  //   $("#textCategory option").each(function() {
  //       cats[$(this).attr("value")] = 1;
  //   });
  //
  //   // Set the Category if it's in the list, otherwise set it as "Other"
  //   var topCat = sjs.index.categories[0];
  //   if (topCat in cats) {
  //       $("#textCategory").val(topCat);
  //   } else {
  //       $("#textCategory").val("Other");
  //       $("#otherCategory").val(topCat);
  //   }
  //   $("#textCategory").trigger("change");
  //
  //   if (!("sectionNames" in sjs.index)) {
  //       $("#textStructureFieldSet").hide();
  //   }
  //   else if (sjs.index.categories[0] !== "Commentary") {
  //       // Remove a section name box if text depth is 1
  //       if (sjs.index.sectionNames.length == 1) {
  //           $(".sectionType:gt(0)").remove();
  //       }
  //
  //       // Add additional section name boxes if needed
  //       for (var i = 2; i < sjs.index.sectionNames.length; i++) {
  //           $("#addSection").trigger("click");
  //       }
  //
  //       // Populate sections names
  //       $(".sectionType").each(function(){
  //           $(this).find("input").val(sjs.index.sectionNames[$(this).index()]);
  //       });
  //   }

  return (
    <div className="editTextInfo">
      <div id="newIndex">
        <div id="newIndexMsg">Sefaria doesn't yet know about the text {title}.
          <div className="sub">Please provide some basic information about this text.</div>
        </div>

        <div className="fieldSet">
          <span className="fieldLabel">
            <div className="help">?
                <div className="helpText">
                  The primary title of a text. Texts may have multiple titles which can be entered below, but this will be the default way of referring to this text.
                  <br/><br/>
                  Titles in this field must use Roman chacters, but may be transliterations. Add titles in Hebrew characters below.
                </div>
            </div>
            Text Title
          </span>
          <input id="textTitle" ref={enTitle} defaultValue={index.current.title}/>
        </div>

        <div className="fieldSet">
          <span className="fieldLabel">
            <div className="help">?
                <div className="helpText">
                  The primary title of a text in Hebrew characters. Alternate Hebrew titles may also be added under "Alternate Titles" below.
                </div>
            </div>
            Hebrew Title
          </span>
          <input id="heTitle" ref={heTitle} defaultValue={index.current.heTitle}/>
        </div>

        <div className="fieldSet">
          <span className="fieldLabel">
            <div className="help">?
              <div className="helpText">
              Alternate English Titles can include alternate translations, alternate transliterations spellings, and abbreviations.<br/><br/>Press enter after each title variant to seprate it from others.
              </div>
            </div>
            Alternate English Titles
            <span className="optional">(optional)</span>
          </span>
          <ul id="textTitleVariants" ref={enTitleVariants} defaultValue={index.current.titleVariants}></ul>
        </div>

        <div className="fieldSet">
            <span className="fieldLabel">
              <div className="help">?
                <div className="helpText">
                  Alternate Hebrew Titles can include alternate spellings and abbreviations.<br/><br/>Press enter after each title variant to seprate it from others.
                </div>
              </div>
              Alternate Hebrew Titles<span className="optional">(optional)</span>
          </span>
          <ul id="textHeTitleVariants" ref={heTitleVariants} defaultValue={index.current.heTitleVariants}></ul>
        </div>

        <div className="fieldSet" id="textCategories">
            <span className="fieldLabel">
              <div className="help">?
                <div className="helpText">
                  A category for the text. Categories are used in searching and grouping texts.
                </div>
              </div>
              Category
            </span>
           <TOCDropdown id="textCategory" categories={index.current.categories}/>
        </div>

        <div className="fieldSet" id="textStructureFieldSet">
            <span className="fieldLabel">
              <div className="help">?
                <div className="helpText">
                  A Text's Structure is represented by the hieracrchy of different types of sections that make up the text.
                  <br/><br/>For example, texts of the Tanakh like Genesis are divided into "Chapters" which are then divided into "Verses".
                  <br/><br/>Larger texts, such as the Mishneh Torah, may have more levels in their hierarchy, for example "Book" > "Section" > "Chapter" > "Law".
                </div>
              </div>
              Text Structure
            </span>
            <div id="sectionTypesBox">
              <span className='sectionType'><input placeholder='e.g. Chapter'/></span>
              <span className='sectionType'> > <input placeholder='e.g. Verse'/> <span className='remove'>X</span></span>
              <span id="addSection">add level of structure</span>
            </div>
        </div>

        <div className="actions">
          <NewIndexSaveButton enTitle={enTitle.current.value} heTitle={heTitle.current.value} enTitleVariants={[]} heTitleVariants={[]}/>
        </div>
      </div>
    </div>
  );
}


function NewIndexSaveButton({enTitle, heTitle, enTitleVariants, heTitleVariants}) {
  const errorOnSave = useRef(false);
  const index = useRef(null);
  index.current = Sefaria.getIndexDetailsFromCache(enTitle);
  const validate = function () {
    let categories = [];
    for (let i=0; i<document.getElementById("categoryMenu").children.length; i++) {
      let child = document.getElementById("categoryMenu").children[i];
      let cat = child.options[child.selectedIndex].value;
      if (cat === "Choose a category") {
        break;
      }
      categories.push(cat);
    }
    if (!enTitle) {
      alert("Please give a text title or commentator name.");
      return false;
    }

    if (!heTitle) {
      alert("Please give a Hebrew text title.");
      return false;
    }

    if (/[.\-\\\/]/.test(enTitle)) {
      alert('Text titles may not contain periods, hyphens or slashes.');
      return false;
    }

    if (/[0-9]/.test(enTitle)) {
      alert('Text titles may not contain numbers. This form is for general information about a text as a whole, not specific citations.');
      return false;
    }

    if (categories.length === 0) {
      alert("Please choose a text category.");
      return false;
    }

    for (let i = 0; i < categories.length; i++) {
      if (/[.\-\\\/]/.test(categories[i])) {
        alert('Categories may not contain periods, hyphens or slashes.');
        return false;
      }
    }


    if (Hebrew.containsHebrew(enTitle)) {
      alert("Please enter a primary title in English. Use the Hebrew Title field to specify a title in Hebrew.");
      return false;
    }
    index.current.title = enTitle;
    index.current.heTitle = heTitle;
    index.current.titleVariants = enTitleVariants;
    index.current.heTitleVariants = heTitleVariants;
    index.current.categories = categories;
    return true;
  }

  const save = function() {
    let postJSON = JSON.stringify(index.current);
    let title = enTitle.replace(/ /g, "_");

    let message = "Saving text information...";
    // if ("oldTitle" in index) {
    //     message += "<br><br>(processing title changes may take some time)"
    // }
    alert(message);
    const request = new Request(
    '/api/v2/raw/index/'+title,
    {headers: {'X-CSRFToken': Cookies.get('csrftoken')}}
    );
    fetch(request, {
      method: 'POST',
      mode: 'same-origin',
      credentials: 'same-origin',
      body: postJSON,
    }).then(response => {
      if (!response.ok) {
        response.text().then(resp_text=> {
          console.log(resp_text);
          errorOnSave.current = true;
        })
      }else{
        response.json().then(resp_json=>{
          console.log("okay response", resp_json);
          errorOnSave.current = false;
        });
      }
    }).catch(error => {
        console.log("network error", error);
        errorOnSave.current = true;
    });

  };

  const validateThenSave = function () {
    if (validate()) {
      save();
    }
  }

  return <span id="newIndexSave" onClick={validateThenSave} className="btn btn-primary btn-large">Save</span>;
}


class ReadMoreText extends Component {
  constructor(props) {
    super(props);
    this.state = {expanded: props.text.split(" ").length < props.initialWords};
  }
  render() {
    /** todo fix interfacetext */
    let text = this.state.expanded ? this.props.text : this.props.text.split(" ").slice(0, this.props.initialWords).join (" ") + "...";
    return <div className="readMoreText">
      {text}
      {this.state.expanded ? null :
        <span className="readMoreLink" onClick={() => this.setState({expanded: true})}>
          <InterfaceText>
            <EnglishText className="int-en">Read More ›</EnglishText>
            <HebrewText className="int-he">קרא עוד ›</HebrewText>
          </InterfaceText>

        </span>
      }
    </div>
  }
}
ReadMoreText.propTypes = {
  text: PropTypes.string.isRequired,
  initialWords: PropTypes.number,
};
ReadMoreText.defaultProps = {
  initialWords: 30
};


/*
  TODO what happened to ExtendedNotes?

  {this.props.mode === "extended notes" ?
  <ExtendedNotes
    title={this.props.title}
    currVersions={this.props.currVersions}
    backFromExtendedNotes={this.props.backFromExtendedNotes}
  />
  : null }
*/



export {BookPage as default, TextTableOfContents};