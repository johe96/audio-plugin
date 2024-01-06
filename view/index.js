/*
    This simple web component just manually creates a set of plain sliders for the
    known parameters, and uses some listeners to connect them to the patch.
*/
class plugin_View extends HTMLElement
{
    constructor (patchConnection)
    {
        super();
        this.patchConnection = patchConnection;
        this.classList = "main-view-element";
        this.innerHTML = this.getHTML();

        //Add a keydown event listener to the window
        window.addEventListener('keydown', this.handleKeyPress.bind(this));
    }




    //Add these keys
    //C4 (Middle C): 261.63 Hz
    //D4: 293.66 HZ
    //E4: 329.63 Hz
    //F4: 349.23 Hz
    //G4: 392.00 Hz
    handleKeyPress(event) {
        let newFrequency;
        if (event.key === 'z') { // Key 'z' corresponds to the note A (440 Hz)
            newFrequency = 440.0;
        } else if (event.key === 'x') { // Key 'x' corresponds to the note B (493.88 Hz)
            newFrequency = 493.88;
        } else if (event.key === 'c') { // - |||| -
            newFrequency = 523.25;
        } else if (event.key === 'v') {
            newFrequency = 587.33;
        } else if (event.key === 'b') {
            newFrequency = 659.25;
        } else if (event.key === 'n') {
            newFrequency = 698.46;
        } else if (event.key === 'm') { // G
            newFrequency = 783.99;
        } else if (event.key === 'q') {
            //event.preventDefault(); // Prevent the default behavior of Tab
            this.changeWaveform();
        } else {
            return; // If the key is not mapped, do nothing
        }
        this.patchConnection.sendEventOrValue('frequency', newFrequency);
    }

    changeWaveform() {
        const waveforms = ['since', 'square', 'triangle'];
        const currentWaveform = this.patchConnection.getParameterValue('waveform');
        const currentIndex = waveforms.indexOf(currentWaveform);
        const nextIndex = (currentIndex + 1) % waveforms.length;
        this.patchConnection.sendEventOrValue('waveform', waveforms[nextIndex]);
    }
    
    connectedCallback()
    {
        // When the HTMLElement is shown, this is a good place to connect
        // any listeners you need to the PatchConnection object..

        // First, find our frequency slider:
        const freqSlider = this.querySelector ("#frequency");

        // When the slider is moved, this will cause the new value to be sent to the patch:
        freqSlider.oninput = () => this.patchConnection.sendEventOrValue (freqSlider.id, freqSlider.value);

        // Create a listener for the frequency endpoint, so that when it changes, we update our slider..
        this.freqListener = value => freqSlider.value = value;
        this.patchConnection.addParameterListener (freqSlider.id, this.freqListener);

        // Now request an initial update, to get our slider to show the correct starting value:
        this.patchConnection.requestParameterValue (freqSlider.id);

        //Our waveform buttons:
        const sineButton = this.querySelector ("#sine");
        const triangleButton = this.querySelector ("#triangle");
        const squareButton = this.querySelector ("#square");

        // When buttons are clicked, send the new waveform type to patch:
        
        sineButton.onclick = () => {
            this.patchConnection.sendEventOrValue ('waveform', 'sine');

        };

        triangleButton.onclick = () => {
            this.patchConnection.sendEventOrValue ('waveform', 'triangle');

        };
        
        squareButton.onclick = () =>{
            this.patchConnection.sendEventOrValue ('waveform', 'square');
        };

         

    }
    disconnectedCallback()
    {
        // When our element is removed, this is a good place to remove
        // any listeners that you may have added to the PatchConnection object.
        this.patchConnection.removeParameterListener ("frequency", this.freqListener);
    }
    getHTML()
    {
        return `
        <style>
            .main-view-element {
                background: #bcb;
                display: block;
                width: 100%;
                height: 100%;
                padding: 10px;
                overflow: auto;
            }
            .param {
                display: inline-block;
                margin: 10px;
                width: 300px;
            }
        </style>
        <div id="controls">
          <p>Your GUI goes here!</p>
          <input type="range" class="param" id="frequency" min="5" max="1000">Frequency</input>
          
          <button id="sine">Sine</button>
          <button id="triangle">Triangle</button>
          <button id="square">Square</button>

        </div>`;
    }
}
window.customElements.define ("plugin-view", plugin_View);
/* This is the function that a host (the command line patch player, or a Cmajor plugin
   loader, or our VScode extension, etc) will call in order to create a view for your patch.

   Ultimately, a DOM element must be returned to the caller for it to append to its document.
   However, this function can be `async` if you need to perform asyncronous tasks, such as
   fetching remote resources for use in the view, before completing.
*/
export default function createPatchView (patchConnection)
{
    return new plugin_View (patchConnection);
}