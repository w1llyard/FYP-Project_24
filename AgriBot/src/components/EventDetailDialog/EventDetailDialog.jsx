import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

const EventDetailDialog = ({ visible, onHide, event, onUpdate, onDelete }) => {
    if (!event) return null; // Render nothing if no event is selected

    const isRainfall = event.title.toLowerCase().startsWith('rainfall');

    return (
        <Dialog header="Event Details" visible={visible} style={{ width: '40vw' }} onHide={onHide} footer={
            !isRainfall ? (
                <div>
                    <Button label="Update" icon="pi pi-pencil" onClick={() => onUpdate(event)} />
                    <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={() => onDelete(event.id)} />
                </div>
            ) : null
        }>
            <div>
                <h3>{event.title}</h3>
                {isRainfall ? (
                    <div>
                        <p><strong>🌧️ Type:</strong> {event.extendedProps.precipitationType}</p>
                        <p><strong>🌧️ Intensity:</strong> {event.extendedProps.precipitation}</p>
                        <p><strong>⏰ Hours of Rain:</strong> {event.extendedProps.HoursOfRain}</p>
                        <p><strong>💧 Probability:</strong> {event.extendedProps.probability}%</p>
                    </div>
                ) : (
                    <div>
                        <p><strong>Description:</strong> {event.extendedProps.description}</p>
                        <p><strong>Category:</strong> {event.extendedProps.category}</p>
                        <p><strong>Date:</strong> {new Date(event.start).toLocaleDateString()}</p>
                    </div>
                )}
            </div>
        </Dialog>
    );
};

export default EventDetailDialog;
