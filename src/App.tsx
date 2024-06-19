import React, { ChangeEvent, useMemo, useState } from 'react';
import './App.scss';
import { peopleFromServer } from './data/people';
import { Person } from './types/Person';
import cn from 'classnames';

function debounce<T>(
  callback: (args: T) => void,
  delay: number,
): (args: T) => void {
  let timerId = 0;

  return (...args) => {
    window.clearTimeout(timerId);

    timerId = window.setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

export const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [appliedQuery, setAppliedQuery] = useState('');
  const [isDropdown, setIsDropdown] = useState(false);

  const applyQuery = useMemo(() => debounce(setAppliedQuery, 1000), []);

  const filteredPeople = useMemo(() => {
    return peopleFromServer.filter(person =>
      person.name.toLowerCase().includes(appliedQuery.toLowerCase()),
    );
  }, [appliedQuery]);

  const onSearchHandler = (event: ChangeEvent<HTMLInputElement>) => {
    if (!filteredPeople.length) {
      event.preventDefault();
    }

    setQuery(event.target.value);
    applyQuery(event.target.value);
    setSelectedPerson(null);
  };

  const onSelect = (person: Person) => () => {
    setQuery(person.name);
    setSelectedPerson(person);
  };

  const onFocus = () => setIsDropdown(true);
  const onBlur = () => setIsDropdown(false);

  return (
    <div className="container">
      <main className="section is-flex is-flex-direction-column">
        <h1 className="title" data-cy="title">
          {selectedPerson
            ? `${selectedPerson.name} (${selectedPerson.born} - ${selectedPerson.died})`
            : 'No selected person'}
        </h1>

        <div
          className={cn('dropdown', {
            'is-active': isDropdown,
          })}
        >
          <div className="dropdown-trigger">
            <input
              type="text"
              placeholder="Enter a part of the name"
              className="input"
              data-cy="search-input"
              value={query}
              onChange={onSearchHandler}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>

          {!!filteredPeople.length && (
            <div
              className="dropdown-menu"
              role="menu"
              data-cy="suggestions-list"
            >
              <div className="dropdown-content">
                {filteredPeople.map(person => (
                  <div
                    key={person.name}
                    className="dropdown-item"
                    data-cy="suggestion-item"
                    onMouseDown={onSelect(person)}
                  >
                    <p className="has-text-link">{person.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {!filteredPeople.length && (
          <div
            className="
            notification
            is-danger
            is-light
            mt-3
            is-align-self-flex-start
          "
            role="alert"
            data-cy="no-suggestions-message"
          >
            <p className="has-text-danger">No matching suggestions</p>
          </div>
        )}
      </main>
    </div>
  );
};
