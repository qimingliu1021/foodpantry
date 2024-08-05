"use client";

import { async } from "@firebase/util";

// ************  MUI imports  ************
import { useState, useEffect, useRef } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Modal,
  TextField,
} from "@mui/material";

// ************  Firebase imports  ************
import { firestore } from "@/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
  addDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { getApp } from "firebase/app";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { Coming_Soon } from "next/font/google";

// ************  Definitions (Outside)  ************

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: 3,
};

const firebaseApp = getApp();
const storage = getStorage(firebaseApp, "gs://my-custom-bucket");

// ************  Definitions (re-rendering)  ************

export default function Home() {
  const [openAdding, setOpenAdding] = useState(false);
  const [openPhoto, setOpenPhoto] = useState(false);
  const [itemName, setItemName] = useState("");
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item.toLowerCase());
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const handleOpenAddItem = () => setOpenAdding(true);
  const handleCloseAddItem = () => setOpenAdding(false);
  const handleOpenPhoto = () => {
    startVideo();
    setOpenPhoto(true);
  };
  const handleClosePhoto = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    }
    setOpenPhoto(false);
    setHasPhoto(false);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm)
  );

  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [photos, setPhotos] = useState([]);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
      })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const takePhoto = () => {
    setHasPhoto(false);
    let video = videoRef.current;
    let photo = photoRef.current;

    let ctx = photo.getContext("2d");
    ctx.drawImage(video, 0, 0, photo.width, photo.height);
    photo.toBlob(async (blob) => {
      const storage = getStorage();
      const photoRef = storageRef(storage, `photos/${Date.now()}.png`);

      const snapshot = await uploadBytes(photoRef, blob);
      const photoUrl = await getDownloadURL(snapshot.ref);

      const docRef = await addDoc(collection(firestore, "photos"), {
        url: photoUrl,
        createAt: new Date(),
      });
      setHasPhoto(true);
      console.log("take photo complete");

      // ********** Fetch the photo and Analyze it using OpenAI API **************
      const result = await fetchFoodName(photoUrl);
      console.log("result is: ", result);
      // result = openAIAnalyzePhoto(photoUrl);
    });

    const fetchFoodName = async (photoUrl) => {
      try {
        console.log("fetchFoodName being called...");
        const response = await fetch("http://localhost:5000/analyzeImage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ photoUrl }),
        });
        const data = await response.json();
        console.log("Food name:", data.name);
        return data.name;
      } catch (error) {
        console.error("Error fetching food name:", error);
      }
    };
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display={"flex"}
      justifyContent={"center"}
      flexDirection={"column"}
      alignItems={"center"}
      gap={2}
    >
      <Modal
        open={openAdding}
        onClose={handleCloseAddItem}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={"row"} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName("");
                handleCloseAddItem();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Modal
        open={openPhoto}
        onClose={handleClosePhoto}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {!hasPhoto ? (
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Look at the camera...
            </Typography>
            <video ref={videoRef} style={{ width: "100%" }} autoPlay />
            <Button variant="outlined" onClick={takePhoto}>
              Take Photo
            </Button>
            <canvas ref={photoRef} style={{ display: "none" }} />
          </Box>
        ) : (
          <Box sx={style}>
            <Typography variant="h6" component="h2">
              Photo Taken!
            </Typography>
            <Typography variant="h6" component="h2">
              It's a ______
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName("");
                handleCloseAddItem();
              }}
            >
              Add to the pantry
            </Button>
          </Box>
        )}
      </Modal>
      <Box>
        <Box>
          <TextField
            id="outlined-basic"
            label="Search for an item"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </Box>
        <Box border={"1px solid #333"}>
          <Box
            width="800px"
            height="100px"
            bgcolor={"#ADD8E6"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Typography variant={"h2"} color={"#333"} textAlign={"center"}>
              Inventory Items
            </Typography>
          </Box>
          <Stack width="800px" height="300px" spacing={2} overflow={"auto"}>
            {filteredInventory.map(({ name, quantity }) => (
              <Box
                key={name}
                width="100%"
                minHeight="150px"
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
                bgcolor={"#f0f0f0"}
                paddingX={5}
              >
                <Typography variant={"h3"} color={"#333"} textAlign={"center"}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant={"h3"} color={"#333"} textAlign={"center"}>
                  Quantity: {quantity}
                </Typography>
                <Button variant="contained" onClick={() => removeItem(name)}>
                  Remove
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>
        <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
          <Button variant="contained" onClick={handleOpenAddItem} sx={{ m: 2 }}>
            Add New Item
          </Button>
          <Button variant="contained" onClick={handleOpenPhoto} sx={{ m: 2 }}>
            Open Camera
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
