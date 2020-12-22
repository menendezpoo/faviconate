import * as React from "react";
import {ChangeEvent} from "react";
import {Button} from "./Button";
import {RefObject} from "react";
import {SuggestionsOverlay} from "../overlays/SuggestionsOverlay";
import {Separator} from "./Separator";
import {Loader} from "./Loader";
import {LabelProps} from "./Label";
import {Clickable} from "./Clickable";
import {Callable} from "../helpers/hui";

export type SuggestionLoader = (text: string) => Promise<Suggestion[]>;

export interface SuggestionsOptions {
    getSuggestions: SuggestionLoader;
    showLoader?: boolean;
    charsToTrigger?: number;
}

export interface Suggestion extends LabelProps{
    key: string;
    separator?: boolean;
    onClick?: Callable;
}

export interface TextBoxProps {
    defaultValue?: string;
    clearButton?: boolean | 'always';
    change?: (text: string) => void;
    placeholder?: string;
    suggestions?: SuggestionLoader | SuggestionsOptions;
    onSuggestionSelected?: (suggestion: Suggestion) => void;
}

interface TextBoxState{
    value: string;
    focused?: boolean;
    suggestions?: Suggestion[];
    loadingSuggestions?: boolean;
    selectedSuggestion?: number;
}

export class TextBox extends React.Component<TextBoxProps, TextBoxState>{

    wRef: RefObject<HTMLDivElement>;
    tRef: RefObject<HTMLInputElement>;
    triggeredWhileLoading = false;

    constructor(props: TextBoxProps){
        super(props);
        this.tRef = React.createRef();
        this.wRef = React.createRef();

        this.state = {
            value: props.defaultValue || '',
            focused: false,
        };

        this.clear = this.clear.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    activateSuggestion(sug: Suggestion){

        this.setState({
            value: sug.text || '',
            suggestions: undefined
        });

        if(this.props.onSuggestionSelected) {
            this.props.onSuggestionSelected(sug);
        }
    }

    clear(){
        this.setState({value: ''});
        if(this.tRef.current){
            this.tRef.current.focus();
        }
    }

    getSuggestionsOptions(): SuggestionsOptions | undefined{

        if(!this.props.suggestions) {
            return;
        }

        if(typeof this.props.suggestions === 'function') {
            return {getSuggestions: this.props.suggestions as any}
        }else{
            return this.props.suggestions;
        }
    }

    handleChange(event: ChangeEvent<HTMLInputElement>){

        this.setState({
            value: event.target.value
        });

        if(this.props.change) {
            this.props.change(event.target.value);
        }

        // Load suggestions on next tick
        setTimeout(() => this.loadSuggestions());
    }

    handleKeyDown(e: React.KeyboardEvent){

        let stop = true;

        if(e.key === 'ArrowUp') {
            this.selectPreviousSuggestion();

        }else if(e.key === 'ArrowDown') {
            this.selectNextSuggestion()

        }else if(e.key === 'Escape') {
            this.setState({suggestions: undefined});

        }else if(e.key === 'Enter'){
            if(typeof this.state.selectedSuggestion === 'number' && this.state.suggestions) {
                this.activateSuggestion(this.state.suggestions[this.state.selectedSuggestion]);
            }
        }else{
            stop = false;
        }

        if(stop) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    async loadSuggestions(){

        const opts = this.getSuggestionsOptions();

        if(
            !opts ||                                                    // No options
            !opts.getSuggestions ||                                     // Options, but no suggestions loader
            this.state.value.length < (opts.charsToTrigger || 3))       // Enough chars to start searching
        {
            this.triggeredWhileLoading = false;
            this.setState({loadingSuggestions: false, suggestions: undefined, selectedSuggestion: undefined});
            return;
        }

        if(this.state.loadingSuggestions) {                             // Already loading, ignore
            this.triggeredWhileLoading = true;                          // Tag as triggeredWhileLoading
            return;
        }

        this.setState({loadingSuggestions: true});

        const pieces = await opts.getSuggestions(this.state.value);

        setTimeout(() => {this.setState({suggestions: pieces, loadingSuggestions: false, selectedSuggestion: undefined});
            if(this.triggeredWhileLoading) {
                this.triggeredWhileLoading = false;
                setTimeout(() => this.loadSuggestions());
            }
        });
    }

    render(){

        const input = <input
            ref={this.tRef}
            placeholder={this.props.placeholder}
            type={`text`}
            value={this.state.value}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
        />;
        const clearButton = this.props.clearButton || false;
        const clearOn = clearButton === 'always' || (clearButton && !!this.state.value);
        const clear = <Button
            icon={clearOn ? `cross` : `empty`}
            classTag={`clear`}
            face={`never`}
            iconSize={8}
            onClick={this.clear}
            disabled={!clearOn}
        />;
        let suggestionOpts = this.getSuggestionsOptions();
        let suggestions = undefined;

        if(
            suggestionOpts &&                                                   // Has suggestions configured
            (this.state.loadingSuggestions || this.state.suggestions) &&        // Is Loading or has suggestions
            this.state.value.length >= (suggestionOpts.charsToTrigger || 3) &&  // Min chars reached
            this.wRef.current                                                   // There is a reference element
        ) {

            const contents = this.state.suggestions?.map(
                (sug, index) => {
                    return sug.separator === true ?
                        <Separator key={sug.key}/> :
                        <Clickable
                            {...sug}
                            isSelected={this.state.selectedSuggestion === index}
                            onClick={() => this.activateSuggestion(sug)}
                        />
                }
            );
            const loader = <Loader text={`Loading`}/>;

            suggestions = (
                <SuggestionsOverlay relativeElement={this.wRef.current}>
                    {contents}
                    {contents && this.state.loadingSuggestions ? <Separator/> : undefined}
                    {this.state.loadingSuggestions ? loader : undefined}
                </SuggestionsOverlay>
            );
        }

        if(clearButton !== false) {
            return (
                <div ref={this.wRef} className={`ui-textbox`}>
                    {input}
                    {clear}
                    {suggestions}
                </div>
            );
        }else{
            return (
                <div ref={this.wRef} className={`ui-textbox`}>
                    {input}
                    {suggestions}
                </div>
            );
        }
    }

    selectNextSuggestion(){
        const suggestions = this.state.suggestions;

        if(!suggestions) {
            return;
        }

        const current = typeof this.state.selectedSuggestion === 'number' ? this.state.selectedSuggestion : -1;
        let next = current + 1;

        if( suggestions[next] && suggestions[next].separator ) {
            next++;
        }

        if(next >= suggestions.length) {
            next = suggestions.length - 1;
        }

        this.setState({selectedSuggestion: next});
    }

    selectPreviousSuggestion(){
        const suggestions = this.state.suggestions;

        if(!suggestions) {
            return;
        }

        const current = typeof this.state.selectedSuggestion === 'number' ? this.state.selectedSuggestion : suggestions.length;
        let prev = current - 1;

        if( suggestions[prev] && suggestions[prev].separator) {
            prev--;
        }

        if(prev < 0) {
            prev = 0;
        }

        this.setState({selectedSuggestion: prev});

    }
}