//MapComponent.js
import React, { useState, useRef } from 'react';
import { fromLonLat } from 'ol/proj';
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import GeoJSON from 'ol/format/GeoJSON';
import { RMap, ROSM, RLayerVector, RStyle, RFeature } from 'rlayers';
import 'ol/ol.css';
import { createEmpty, extend } from 'ol/extent';
import monument from './monument.svg';
import MapControls from './MapControls';
import IconMenu from './IconMenu';

export default function MapComponent() {
  const [features, setFeatures] = useState([]);
  const [iconFeatures, setIconFeatures] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const mapRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const geojson = e.target.result;
      const parsedFeatures = new GeoJSON({
        featureProjection: 'EPSG:3857',
        featureClass: Feature,
      }).readFeatures(geojson);

      setFeatures(parsedFeatures);

      let extent = createEmpty();
      parsedFeatures.forEach((feature) => {
        extend(extent, feature.getGeometry().getExtent());
      });

      if (mapRef.current) {
        mapRef.current.ol.getView().fit(extent, { duration: 1000 });
      }
    };

    if (file) {
      reader.readAsText(file);
    }
  };

  const handleIconAdd = (e) => {
    if (isEditMode && isAddMode) {
      const coords = e.map.getCoordinateFromPixel(e.pixel);
      const info = prompt('Enter info for this icon:', '');
      const newIconFeature = new Feature({
        geometry: new Point(coords),
        uid: Date.now(),
        info,
        menuOptions: [], // Initialize an empty array for menu options
      });
      setIconFeatures([...iconFeatures, newIconFeature]);
    }
  };

  const handleIconClick = (uid) => {
    const featureToClick = iconFeatures.find((f) => f.get('uid') === uid);
    if (isEditMode && !isDeleteMode) {
      handleEditInfo(uid);
    } else if (isEditMode && isDeleteMode) {
      handleIconDelete(uid);
    } else {
      setSelectedFeature(featureToClick);
    }
  };

  const handleEditInfo = (uid) => {
    const featureToEdit = iconFeatures.find((f) => f.get('uid') === uid);
    const newInfo = prompt('Edit info:', featureToEdit.get('info') || '');
    featureToEdit.set('info', newInfo);
    setIconFeatures([...iconFeatures]);
  };

  const handleDownload = () => {
    const format = new GeoJSON();
    const allFeatures = [...features, ...iconFeatures];
    const geojsonStr = format.writeFeatures(allFeatures, {
      featureProjection: 'EPSG:3857',
    });

    const blob = new Blob([geojsonStr], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'merged-map.geojson';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = () => {
    setIsEditMode(false);
    setIsAddMode(false);
    setIsDeleteMode(false);
    setSelectedFeature(null);
  };

  const showInfoBox = (feature, event) => {
    const { clientX, clientY } = event.originalEvent; // Get screen coordinates
    setHoveredFeature({
      feature,
      x: clientX - 60, // Slight offset from the cursor
      y: clientY -60, // Slight offset from the cursor
    });
  };
  
  

  const hideInfoBox = () => {
    setHoveredFeature(null);
  };

  const toggleAddMode = () => {
    setIsAddMode(true);
    setIsDeleteMode(false);
  };

  const toggleDeleteMode = () => {
    setIsDeleteMode(true);
    setIsAddMode(false);
  };

  const handleIconDelete = (uid) => {
    if (isEditMode && isDeleteMode) {
      setIconFeatures(iconFeatures.filter((f) => f.get('uid') !== uid));
    }
  };

  const getMenuOptions = (feature) => [
    {
      label: 'New Feature',
      onClick: () => {
        alert('New Feature Clicked');
        // Add logic for "New Feature"
      },
    },
    {
      label: 'Info',
      onClick: () => {
        alert('Info Clicked');
        // Add logic for "Info"
      },
    },
    {
      label: 'New Settings',
      onClick: () => {
        alert('New Settings Clicked');
        // Add logic for "New Settings"
      },
    },
    {
      label: 'External Link',
      onClick: () => {
        window.open('https://example.com', '_blank');
        // Add logic for "External Link"
      },
    },
  ];

  return (
    <div>
      <h2>GeoJSON Map Viewer</h2>
      <input type="file" accept=".geojson" onChange={handleFileUpload} />
      <MapControls
        isEditMode={isEditMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        onSave={handleSave}
        onAddMode={toggleAddMode}
        onDeleteMode={toggleDeleteMode}
        isAddMode={isAddMode}
        isDeleteMode={isDeleteMode}
      />

      <button onClick={handleDownload}>Download GeoJSON</button>

      {hoveredFeature && (
        <div
          className="info-box"
          style={{
            position: 'absolute',
            top: hoveredFeature.y,
            left: hoveredFeature.x,
          }}
        >
          {hoveredFeature.feature.get('info') || 'No info available'}
        </div>
      )}

      {selectedFeature && (
        <IconMenu
          options={getMenuOptions(selectedFeature)}
          onClose={() => setSelectedFeature(null)}
        />
      )}

      <RMap
        ref={mapRef}
        className="map"
        width="1100px"
        height="500px"
        initial={{ center: fromLonLat([0, 0]), zoom: 2 }}
        onClick={handleIconAdd}
      >
        <ROSM />

        {/* GeoJSON layer */}
        {features.length > 0 && (
          <RLayerVector features={features}>
            <RStyle.RStyle>
              <RStyle.RStroke color="blue" width={2} />
              <RStyle.RFill color="rgba(0, 0, 255, 0.1)" />
            </RStyle.RStyle>
          </RLayerVector>
        )}

        {/* Icon layer */}
        {iconFeatures.length > 0 && (
          <RLayerVector>
            <RStyle.RStyle>
              <RStyle.RIcon src={monument} scale={0.7} />
            </RStyle.RStyle>
            {iconFeatures.map((f) => (
              <RFeature
                key={f.get('uid')}
                feature={f}
                onPointerEnter={(event) => showInfoBox(f, event)}
                onPointerLeave={hideInfoBox}
                onClick={() => handleIconClick(f.get('uid'))}
              />
            ))}
          </RLayerVector>
        )}
      </RMap>
    </div>
  );
}


