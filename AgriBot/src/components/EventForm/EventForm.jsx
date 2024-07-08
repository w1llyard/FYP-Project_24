import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import styles from "./EventForm.module.css";
import { Toast } from "primereact/toast";

const EventForm = ({ visible, onHide, onSave, initialDate, event }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(initialDate || null);
  const [category, setCategory] = useState(null);
  const toast = useRef(null);

  const categories = [{ label: "Harvest", value: "Harvest" }];

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.extendedProps.description);
      setStartDate(event.start);

      setCategory(event.extendedProps.category);
    }
  }, [event]);

  const showToast = (message) => {
    toast.current.show({
      severity: "error",
      summary: "Validation Error",
      detail: message,
      life: 3000,
    });
  };

  const handleSubmit = () => {
    const now = new Date();
    
    if (!title) {
      showToast("Title is required.");
      return;
    }
    if (title.toLowerCase().startsWith("rainfall")) {
      showToast('Title cannot start with "Rainfall".');
      return;
    }
    if (!description) {
      showToast("Description is required.");
      return;
    }
    if (!startDate) {
      showToast("Start date is required.");
      return;
    }
    if (startDate < now) {
      showToast("Start date must be in the future.");
      return;
    }
    if (!category) {
      showToast("Category is required.");
      return;
    }

    onSave({
      title,
      description,
      startDate,
      category,
    });
    onHide();
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="New Event"
        visible={visible}
        style={{ width: "40vw" }}
        onHide={onHide}
        footer={
          <Button label="Save" icon="pi pi-check" onClick={handleSubmit} />
        }
      >
        <div className={styles.p_fluid}>
          <div className={styles.p_field}>
            <label htmlFor="title">Title</label>
            <InputText
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className={styles.p_field}>
            <label htmlFor="description">Event Description</label>
            <InputTextarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div className={styles.p_field}>
              <label htmlFor="startDate">Start Date</label>
              <Calendar
                value={startDate}
                onChange={(e) => setStartDate(e.value)}
              />
            </div>
          </div>
          <div className={styles.p_field}>
            <label htmlFor="category">Category</label>
            <Dropdown
              id="category"
              value={category}
              options={categories}
              onChange={(e) => setCategory(e.value)}
              placeholder="Select a Category"
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default EventForm;
