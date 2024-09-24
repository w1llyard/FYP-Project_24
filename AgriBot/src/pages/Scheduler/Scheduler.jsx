import React, { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css"; // optional for styling
import useWeatherForecast from "../../hooks/useWeatherForecast";
import styles from "./scheduler.module.css";
import { extractDatePart } from "../../utils/utilsFunction";
import EventForm from "../../components/EventForm/EventForm";
import EventDetailDialog from "../../components/EventDetailDialog/EventDetailDialog";
import { Toast } from "primereact/toast";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/firebase"; // Adjust the path as needed

const getSeverityColor = (intensity) => {
  if (intensity === "Moderate") {
    return "red";
  } else if (intensity === "Heavy") {
    return "darkred";
  } else {
    return "orange";
  }
};

const Scheduler = () => {
  const { forecast, error } = useWeatherForecast();
  const [events, setEvents] = useState([]);
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [isDetailDialogVisible, setDetailDialogVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const toast = useRef(null);
  const isFetched = useRef(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const q = query(
          collection(db, "Events"),
          where("date", ">=", today),
          orderBy("date")
        );
        const querySnapshot = await getDocs(q);
        const firebaseEvents = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title,
          date: extractDatePart(doc.data().date.toDate()),
          extendedProps: doc.data().extendedProps,
        }));
        setEvents((prevEvents) => [...prevEvents, ...firebaseEvents]);
      } catch (error) {
        console.error("Error fetching events: ", error);
      }
    };
    if (!isFetched.current) {
      fetchEvents();
      isFetched.current = true;
    }
  }, []);

  useEffect(() => {
    if (forecast) {
      const rainfallEvents = forecast
        .filter(
          (day) =>
            day.Day.HasPrecipitation && day.Day.PrecipitationType === "Rain"
        )
        .map((day) => ({
          title: `Rainfall: ${day.Day.PrecipitationIntensity}`,
          date: extractDatePart(day.Date),
          extendedProps: {
            type: "rain",
            precipitation: day.Day.PrecipitationIntensity,
            precipitationType: day.Day.PrecipitationType,
            HoursOfRain: day.Day.HoursOfRain,
            probability: day.Day.RainProbability,
            severityColor: getSeverityColor(day.Day.PrecipitationIntensity),
          },
        }));
      setEvents((prevEvents) => [...prevEvents, ...rainfallEvents]);
    }
  }, [forecast]);

  const handleEventDidMount = (info) => {
    const content = info.event.title.toLowerCase().startsWith("rainfall")
      ? `<div class="${styles.customTooltip}">
        <h3>🌧️ Rainfall Details</h3>
        <hr>
        <p><strong>🌧️ Type:</strong> ${info.event.extendedProps.precipitationType}</p>
        <p><strong>🌧️ Intensity:</strong> ${info.event.extendedProps.precipitation}</p>
        <p><strong>⏰ Hours of Rain:</strong> ${info.event.extendedProps.HoursOfRain}</p>
        <p><strong>💧 Probability:</strong> ${info.event.extendedProps.probability}%</p>
      </div>`
      : `<div class="${styles.customTooltip}">
        <h3>Event Details</h3>
        <hr>
        <p><strong>Description:</strong>Make robot harvest</p>
      </div>`;

    tippy(info.el, {
      content,
      allowHTML: true,
      placement: "top",
      theme: "custom",
    });
  };

  const renderEventContent = (eventInfo) => {
    const { type, precipitation } = eventInfo.event.extendedProps;

    let icon, backgroundColor;
    if (type === "rain") {
      if (precipitation < 2) {
        icon = "🌦️"; // Light rain
      } else if (precipitation >= 2 && precipitation <= 5) {
        icon = "🌧️"; // Moderate rain
      } else {
        icon = "⛈️"; // Heavy rain
      }
      backgroundColor = eventInfo.event.extendedProps.severityColor;
    } else {
      icon = "🌾"; // Harvest event
      backgroundColor = "green";
    }

    return (
      <div
        className={styles.hazard}
        style={{ backgroundColor: backgroundColor }}
      >
        <b className={styles.event_text}>
          {icon + " " + eventInfo.event.title}
        </b>
      </div>
    );
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setDetailDialogVisible(true);
  };

  const isHarvestEventOnDate = (date) => {
    return events.some(
      (event) => event.date == extractDatePart(date) && event.title == "Auto Harvest"
    );
  };

  const handleDateClick = (info) => {
    const today = new Date();
    if (info.date < today.setHours(0, 0, 0, 0)) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Cannot add events to past dates",
        life: 3000,
      });
      return;
    }

    if (isHarvestEventOnDate(info.date)) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "An event with the title 'Auto Harvest' already exists on this date.",
        life: 3000,
      });
      return;
    }

    setSelectedDate(info.date);
    setSelectedEvent(null); // Reset selected event to null
    setDialogVisible(true);
    setFormKey(formKey + 1); // Change the form key to force re-mount
  };
  const handleUpdate = (event) => {
    setSelectedEvent(event);
    setDialogVisible(true);
    setDetailDialogVisible(false);
    setFormKey(formKey + 1); // Change the form key to force re-mount
  };

  const handleDelete = async (eventId) => {
    try {
      await deleteDoc(doc(db, "Events", eventId));
      setEvents(events.filter((event) => event.id !== eventId));
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Event deleted successfully",
        life: 3000,
      });
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete event",
        life: 3000,
      });
    }
    setDetailDialogVisible(false);
  };
  const handleSave = async (newEvent) => {
    const newEventDate = (newEvent.startDate);

    // Check if adding/updating event conflicts with existing 'Auto Harvest' event on that date
    if (newEvent.title == "Auto Harvest" && isHarvestEventOnDate(newEventDate)) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Only one Auto Harvest Event per day",
        life: 3000,
      });
      return;
    }

    if (selectedEvent) {
      // Update existing event
      try {
        const eventRef = doc(db, "Events", selectedEvent.id);

        // Check if changing the date and it conflicts with a 'Auto Harvest' event
        if (
          newEvent.title == "Auto Harvest" &&
          newEventDate != selectedEvent.date &&
          isHarvestEventOnDate(newEventDate)
        ) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Only one Auto Harvest Event per day",
            life: 3000,
          });
          return;
        }

        await updateDoc(eventRef, {
          title: newEvent.title,
          date: newEvent.startDate,
          extendedProps: {
            category: newEvent.category,
            severityColor: newEvent.type === "rain" ? "blue" : "green",
          },
        });

        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === selectedEvent.id
              ? {
                  ...event,
                  title: newEvent.title,
                  date: extractDatePart(newEvent.startDate),
                  extendedProps: {
                    category: newEvent.category,
                    severityColor: newEvent.type === "rain" ? "blue" : "green",
                  },
                }
              : event
          )
        );

        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Event updated successfully",
          life: 3000,
        });
      } catch (error) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to update event",
          life: 3000,
        });
      }
    } else {
      // Add new event
      try {
        const docRef = await addDoc(collection(db, "Events"), {
          title: newEvent.title,
          date: newEvent.startDate,
          extendedProps: {
            category: newEvent.category,
            severityColor: newEvent.type === "rain" ? "blue" : "green",
          },
        });

        setEvents((prevEvents) => [
          ...prevEvents,
          {
            id: docRef.id,
            title: newEvent.title,
            date: extractDatePart(newEvent.startDate),
            extendedProps: {
              category: newEvent.category,
              severityColor: newEvent.type === "rain" ? "blue" : "green",
            },
          },
        ]);

        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Event added successfully",
          life: 3000,
        });
      } catch (error) {
        console.log(error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to add event",
          life: 3000,
        });
      }
    }

    setDialogVisible(false);
    setSelectedEvent(null);
  };

  return (
    <div className={styles.scheduler}>
      {error && <p>Error: {error}</p>}
      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        eventDidMount={handleEventDidMount}
        eventContent={renderEventContent}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
      />
      <EventForm
        key={formKey} // Use formKey to force re-mount
        visible={isDialogVisible}
        onHide={() => setDialogVisible(false)}
        onSave={handleSave}
        initialDate={selectedDate}
        event={selectedEvent}
      />
      <EventDetailDialog
        visible={isDetailDialogVisible}
        onHide={() => setDetailDialogVisible(false)}
        event={selectedEvent}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
      <Toast ref={toast} />
    </div>
  );
};

export default Scheduler;
