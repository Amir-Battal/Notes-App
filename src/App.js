import React, {useState, useEffect} from "react";
import './App.css';
import Preview from "./components/Preview";
import Message from "./components/Mssages";
import NotesContainer from "./components/Notes/NotesContainer";
import NotesList from "./components/Notes/NotesList";
import Note from "./components/Notes/Note";
import NoteForm from "./components/Notes/NoteForm";
import Alert from "./components/Alert";

function App() {

    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedNote, setSelectedNote] = useState(null);
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);


    useEffect(() => {
        if(localStorage.getItem('notes')){
            setNotes(JSON.parse(localStorage.getItem('notes')));
        } else{
            localStorage.setItem('notes', JSON.stringify([]));
        }
    }, []);

    useEffect(() => {
        if(validationErrors.length !== 0){
            setTimeout(() => {
                setValidationErrors([]);
            }, 3000)
        }
    }, [validationErrors]);

    const saveToLocalStorage = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    const validate = () => {
        const validationErrors = [];
        let passed = true;
        if(!title){
            validationErrors.push("الرجاء إدخال عنوان الملاحظة");
            passed = false;
        }

        if(!content){
            validationErrors.push("الرجاء إدخال محتوى الملاحظة");
            passed = false;
        }

        setValidationErrors(validationErrors);
        return passed;
    }

    // تغيير عنوان الملاحظة
    const changeTitleHandler = (event) => {
        setTitle(event.target.value);
    }

    // تغيير محتوى الملاحظة
    const changeContentHandler = (event) => {
        setContent(event.target.value);
    }

    // حفظ الملاحظة
    const saveNoteHandler = () => {

        if(!validate()) return;

        const note = {
            id: new Date(),
            title: title,
            content: content
        }

        const updatedNotes = [...notes, note];

        saveToLocalStorage('notes', updatedNotes);
        setNotes(updatedNotes);
        setCreating(false);
        setSelectedNote(note.id);
        setTitle('');
        setContent('');
    }

    // اختيار ملاحظة
    const selectNoteHandler = noteId => {
        setSelectedNote(noteId);
        setCreating(false);
        setEditing(false);
    }

    // الانتقال الى وضع تعديل ملاحظة
    const editNoteHandler = () => {
        const note = notes.find(note => note.id === selectedNote);
        setEditing(true);
        setTitle(note.title);
        setContent(note.content);
    }

    // تعديل ملاحظة
    const updateNoteHandler = () => {

        if(!validate()) return;

        const updatedNotes = [...notes];
        const noteIndex = notes.findIndex(note => note.id === selectedNote);
        updatedNotes[noteIndex] = {
            id: selectedNote,
            title: title,
            content: content
        };

        saveToLocalStorage('notes', updatedNotes)
        setNotes(updatedNotes);
        setEditing(false);
        setTitle('');
        setContent('');
    }

    // الانتقال الى واجهة اضافة ملاحظة
    const addNoteHandler = () => {
        setCreating(true);
        setEditing(false);
        setTitle('');
        setContent('');
    }

    // حذف ملاحظة
    const deleteNoteHandler = () => {
        const updatedNotes = [...notes];
        const noteIndex = updatedNotes.findIndex(note => note.id === selectedNote);
        notes.splice(noteIndex, 1);
        saveToLocalStorage('notes', notes);
        setNotes(notes);
        setSelectedNote(null);
    }

    const getAddNote = () => {
    return (
      <NoteForm
        formTitle="ملاحظة جديدة"
        title={title}
        content={content}
        titleChanged={changeTitleHandler}
        contentChanged={changeContentHandler}
        submitText="حفظ"
        submitClicked={saveNoteHandler}
      />
    );
  };

  const getPreview = () => {
      if(notes.length === 0) {
          return <Message title="لا يوجد ملاحظات"/>
      }

      if(!selectedNote) {
          return <Message title="الرجاء اختيار ملاحظة"/>
      }

      const note = notes.find(note => {
          return note.id === selectedNote
      });

      let noteDisplay = (
          <div>
              <h2>{note.title}</h2>
              <p>{note.content}</p>
          </div>
      )

      if(editing) {
          noteDisplay = (
              <NoteForm
                  formTitle="تعديل ملاحظة"
                  title={title}
                  content={content}
                  titleChanged={changeTitleHandler}
                  contentChanged={changeContentHandler}
                  submitText="تعديل"
                  submitClicked={updateNoteHandler}
              />
          );
      }

      return (
          <div>
              {!editing &&
                  <div className="note-operations">
                      <a href="#" onClick={editNoteHandler}>
                          <i className="fa fa-pencil-alt"/>
                      </a>
                      <a href="#">
                          <i className="fa fa-trash" onClick={deleteNoteHandler}/>
                      </a>
                  </div>
              }

              {noteDisplay}
          </div>
      );
  };



    return (
        <div className="App">

            <NotesContainer>
            <NotesList>
            {notes.map(note =>
                <Note
                    key={note.id}
                    title={note.title}
                    noteClicked={() => selectNoteHandler(note.id)}
                    active={selectedNote === note.id}
                />
            )}
        </NotesList>
        <button className="add-btn" onClick={addNoteHandler}>+</button>
      </NotesContainer>

      <Preview>
          {creating ? getAddNote() : getPreview()}
      </Preview>

      {validationErrors.length !== 0 && <Alert validationMessages={validationErrors}/>}

    </div>
  );
}

export default App;
