import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import {
  createLocation,
  deleteLocation,
  getSortedLocations,
} from "~/database/controller/general/locations.server";
import { MapPin } from "lucide-react";
import MainLayout from "~/layouts/main";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  switch (request.method) {
    case "POST":
      const name = formData.get("location_name") as string;
      const defaultLocation = formData.get("location_default") as string;
      await createLocation(name, defaultLocation);
      break;
    case "DELETE":
      const locationId = +formData.get("location_id")!;
      await deleteLocation(locationId);
      break;
    default:
      break;
  }
  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/",
  });
  const locations = await getSortedLocations();
  return { user: user!, locations };
}

export default function locations() {
  const data = useLoaderData<typeof loader>();
  const subtmit = useSubmit();
  const navigation = useNavigation();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    subtmit(e.currentTarget);
    e.currentTarget.reset();
  };
  return (
    <MainLayout user={data.user}>
      <p className="mt-2 text-sm pl-5">
        Encuentra de manera rapida lo que buscas.
      </p>
      <Form
        className="p-2 border w-96 rounded-md ml-5 mt-3 space-y-4"
        onSubmit={(e) => handleSubmit(e)}
        method="post"
      >
        <legend className="font-bold text-xl">Nueva ubicacion</legend>
        <div className="space-y-2">
          <label htmlFor="location_name" className="text-sm">
            Nombre de ubicacion:
          </label>
          <Input
            id="location_name"
            placeholder="Nombre del lugar ej: Zona A"
            type="text"
            name="location_name"
            required
          />
        </div>
        {!data.locations?.find(
          (location) => location.defaultLocation === true
        ) ? (
          <div className="space-y-2 flex items-center gap-x-5">
            <label htmlFor="location_default" className="text-sm">
              Ubicacion Default?
            </label>
            <Checkbox
              className="h-4 w-4"
              id="location_default"
              name="location_default"
            />
          </div>
        ) : null}
        <div className="flex justify-end">
          <Button
            className="w-full"
            disabled={
              navigation.state === "submitting"
                ? true
                : navigation.state === "loading"
                ? true
                : false
            }
          >
            Añadir ubicacion
          </Button>
        </div>
      </Form>
      <div className="ml-5 mt-4 grid grid-cols-3 gap-y-8">
        {data.locations?.map((item, index) => (
          <LocationCard
            key={index}
            name={item.name}
            groupedFlowers={item.groupedFlowers}
            defaultLocation={item.defaultLocation}
          />
        ))}
      </div>
    </MainLayout>
  );
}

interface GroupedFlower {
  flowerBoxId: number;
  currentStockFresh: number;
  currentwiltedFlowers: number;
  name: string;
}

interface SortedLocationData {
  name: string;
  groupedFlowers: GroupedFlower[];
  defaultLocation?: boolean | null;
}

const LocationCard = ({
  name,
  groupedFlowers,
  defaultLocation,
}: SortedLocationData) => {
  return (
    <Card className="hover:shadow-md w-96 rounded-md shadow-none hover:border-blue-500 transition ease-in hover:ring-2 hover:ring-blue-200 duration-75">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-lg">{name}</CardTitle>
        </div>
        {defaultLocation && (
          <>
            <div className="flex items-center gap-x-3">
              <p className="text-sm font-semibold">Default</p>
              <div className="h-3 w-3 bg-green-500 ring-2 border-2 border-green-400 ring-green-200 animate-pulse rounded-full"></div>
            </div>
            <p className="text-xs">
              Cuando crees una flor esta ubicacion sera asignada
              automaticamente.
            </p>
          </>
        )}
      </CardHeader>
      <CardContent>
        <p>Resumen:</p>
        <nav className="text-sm space-y-2 pt-2">
          {groupedFlowers.length > 0 ? (
            groupedFlowers.map((flower, index) => (
              <li key={index}>
                {flower.name}: {flower.currentStockFresh} unidades
              </li>
            ))
          ) : (
            <li>No existen flores agregadas.</li>
          )}
        </nav>
        <div className="text-sm text-muted-foreground text-end">
          Total de flores:{" "}
          {groupedFlowers.reduce(
            (acc, flower) =>
              acc +
              (flower.currentStockFresh + (flower.currentwiltedFlowers || 0)),
            0
          )}
        </div>
      </CardContent>
    </Card>
  );
};
