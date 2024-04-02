import { useState, useEffect } from "react";
import {InterfaceText, EnglishText, HebrewText} from "./Misc";
import Sefaria from "./sefaria/sefaria";
import SearchState from './sefaria/searchState';
import SearchResultList  from './SearchResultList';
import DictionarySearch  from './DictionarySearch';
import classNames from 'classnames';

import {
  SearchButton,
} from './Misc';


const SidebarSearch = ({ title, updateAppliedOptionSort, navigatePanel, sidebarSearchQuery, setSidebarSearchQuery, onSidebarSearchClick }) => {
  const [lexiconName, setLexiconName] = useState(Sefaria.getIndexDetailsFromCache(title)?.lexiconName)
  const [searchFilterPathForBook, setSearchFilterPathForBook] = useState('');
  const [query, setQuery] = useState(sidebarSearchQuery || '');
  const isDictionary = !!lexiconName;
  const [searchState, setSearchState] = useState(
          new SearchState({
                  type: 'text',
                  appliedFilters:        [searchFilterPathForBook],
                  field:                 "naive_lemmatizer",
                  appliedFilterAggTypes: ["path"],
                  sortType:              "chronological",
          })
      )

  useEffect(() => {
      attachKeyboard();
      const searchInput = document.getElementById('searchQueryInput')
      if (searchInput) {
          searchInput.value = query
      }
  }, []);

  useEffect(() => {
      Sefaria.bookSearchPathFilterAPI(title).then((path) => {
        setSearchFilterPathForBook(path)
      })
      setSidebarSearchQuery(query)
  }, [query])

  useEffect(() => {
      setSearchState(
        new SearchState({
                type: 'text',
                appliedFilters:        [searchFilterPathForBook],
                field:                 "naive_lemmatizer",
                appliedFilterAggTypes: ["path"],
                sortType:              "chronological",
                filtersValid: true,
        })
      )
  }, [searchFilterPathForBook])

   const attachKeyboard = () => {
      const inputElement = document.querySelector('.sidebarSearch input');
      if (inputElement && (!inputElement.VKI_attached)) {
        VKI_attach(inputElement);
      }
    }


  const inputClasses = classNames({
    search: 1,
    serif: 1,
    keyboardInput: Sefaria.interfaceLang === "english",
    hebrewSearch: Sefaria.interfaceLang === "hebrew"
    });
  // const searchBoxClasses = classNames({searchBox: 1, searchFocused: this.state.searchFocused});
  const searchBoxClasses = classNames({searchBox: 1});

  const handleSearchButtonClick = () => {
    const searchBoxValue = document.getElementById('searchQueryInput').value
    if (searchBoxValue !== query) {
      setSearchFilterPathForBook('')
      setQuery(document.getElementById('searchQueryInput').value)
    }
  }


  return (
    <div className="sidebarSearch lexicon-content">
<div id="customgpt_chat"></div>
<script src="https://cdn.customgpt.ai/js/sge.js" div_id="customgpt_chat" p_id="14201" p_key="4d027a76463af44205d39cda7ec12df4" height="278px"></script>

{/*       {query ?
        <SearchResultList
          query={query}
          compare={false}
          searchInBook={true}
          tab="text"
          types={["text"]}
          textSearchState={searchState}
          updateTotalResults={n => console.log(n)}
          registerAvailableFilters={n => console.log(n)}
          updateAppliedOptionSort={updateAppliedOptionSort}
          onResultClick={onSidebarSearchClick}
        /> :

        null

    } */}


    </div>
  );



}




export default SidebarSearch;
