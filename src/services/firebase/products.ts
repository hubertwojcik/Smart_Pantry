import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./index";
import { Product } from "../../types";

/** Produkty są zapisywane per-użytkownik: users/{uid}/products/{productId}. */
const productsCollection = (uid: string) =>
  collection(db, "users", uid, "products");

const productDoc = (uid: string, id: string) =>
  doc(db, "users", uid, "products", id);

/** Firestore nie akceptuje wartości undefined — usuwamy je przed zapisem. */
const stripUndefined = <T extends Record<string, unknown>>(obj: T) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  );

/** Subskrypcja produktów użytkownika w czasie rzeczywistym. */
export const subscribeProducts = (
  uid: string,
  onChange: (products: Product[]) => void,
) =>
  onSnapshot(productsCollection(uid), (snapshot) => {
    const products = snapshot.docs.map(
      (d) => ({ id: d.id, ...(d.data() as Omit<Product, "id">) }) as Product,
    );
    onChange(products);
  });

export const addProductDoc = (uid: string, product: Omit<Product, "id">) =>
  addDoc(productsCollection(uid), stripUndefined(product));

export const updateProductDoc = (
  uid: string,
  id: string,
  updates: Partial<Product>,
) => updateDoc(productDoc(uid, id), stripUndefined(updates));

export const deleteProductDoc = (uid: string, id: string) =>
  deleteDoc(productDoc(uid, id));
